const folderMapping = {
  evaluation: "1yGGH9qgl2teRSLW2ilCvlv31nZZ3jfx9",
  AMO: "1HWkYi9m2pZlguXPSz8N49Ot_uw8rwRPI",
  R_D: "1r4NLyxRmfNfIi7QILl3ctnuW2kffLnsi",
};

function getFolderIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  let folderParam = params.get("folder");
  if (!folderParam) return null;

  if (folderMapping.hasOwnProperty(folderParam.toLowerCase())) {
    return folderMapping[folderParam.toLowerCase()];
  }

  return folderParam;
}

const folderId = getFolderIdFromUrl();

if (!folderId) {
  document.body.innerHTML = "<p class='error-message'>No folder specified in URL. Use ?folder=evaluation or another folder name.</p>";
} else {
  const API_KEY = "AIzaSyAf8fcQDvfOsuRATtYR9ftdSijNfO4uBPs"; // Replace with your actual key

  async function fetchFiles() {
    const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+trashed=false&key=${API_KEY}&fields=files(id,name,createdTime,webViewLink,thumbnailLink,hasThumbnail)&orderBy=createdTime desc`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (!data.files) {
        document.body.innerHTML = "<p class='error-message'>No files found or error fetching files.</p>";
        return;
      }
      renderFiles(data.files);
    } catch (e) {
      document.body.innerHTML = "<p class='error-message'>Error fetching files.</p>";
      console.error(e);
    }
  }

  function renderFiles(files) {
    const filtered = files.filter(file => /^\d{2}-\d{4}-.+/.test(file.name));

    // Sort by date from filename
    filtered.sort((a, b) => {
      const [ma, ya] = a.name.split("-").map((p, i) => i < 2 ? parseInt(p) : p);
      const [mb, yb] = b.name.split("-").map((p, i) => i < 2 ? parseInt(p) : p);
      const da = new Date(ya, ma - 1);
      const db = new Date(yb, mb - 1);
      return db - da;
    });

    if (filtered.length === 0) {
      document.body.innerHTML = "<p class='error-message'>No valid files found matching naming pattern (MM-YYYY-Title.ext).</p>";
      return;
    }

    const container = document.createElement("div");
    container.className = "container";

    filtered.forEach(file => {
      let parts = file.name.split("-");
      let datePart = parts[0] + "-" + parts[1];
      let titlePart = parts.slice(2).join("-").replace(/\.[^/.]+$/, ""); // remove extension

      const card = document.createElement("div");
      card.className = "flashcard";

      if (file.hasThumbnail && file.thumbnailLink) {
        const img = document.createElement("img");
        // Improve thumbnail resolution
        img.src = file.thumbnailLink.replace(/=s\d+/, "=s800");
        img.alt = titlePart;

        card.appendChild(img);
        card.addEventListener("click", () => {
          window.open(file.webViewLink, "_blank");
        });
      } else {
        const content = document.createElement("div");
        content.className = "content";

        const dateEl = document.createElement("p");
        dateEl.textContent = datePart;
        dateEl.style.fontWeight = "bold";

        const titleEl = document.createElement("p");
        titleEl.textContent = titlePart;
        titleEl.style.margin = "8px 0";

        const downloadBtn = document.createElement("a");
        downloadBtn.href = file.webViewLink;
        downloadBtn.target = "_blank";
        downloadBtn.rel = "noopener noreferrer";
        downloadBtn.className = "download-btn";
        downloadBtn.textContent = "Download";

        content.appendChild(dateEl);
        content.appendChild(titleEl);
        content.appendChild(downloadBtn);

        card.appendChild(content);
      }

      container.appendChild(card);
    });

    document.body.innerHTML = "";
    document.body.appendChild(container);
  }

  fetchFiles();
}
