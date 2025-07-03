const folderMapping = {
  evaluation: "1yGGH9qgl2teRSLW2ilCvlv31nZZ3jfx9",
  AMO: "1HWkYi9m2pZlguXPSz8N49Ot_uw8rwRPI",
  R_D: "1r4NLyxRmfNfIi7QILl3ctnuW2kffLnsi",
  // add more mappings here
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

function getHighResThumbnail(url) {
  if (!url) return url;
  // Replace =s<number> at the end with =s800 for bigger thumbnail
  return url.replace(/=s\d+$/, '=s800');
}

if (!folderId) {
  document.body.innerHTML = "<p style='padding:20px; font-family: sans-serif;'>No folder specified in URL.<br>Use ?folder=evaluation or another folder name.</p>";
} else {
  const API_KEY = "AIzaSyAf8fcQDvfOsuRATtYR9ftdSijNfO4uBPs";

  async function fetchFiles() {
    const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+trashed=false&key=${API_KEY}&fields=files(id,name,createdTime,webViewLink,thumbnailLink)&orderBy=createdTime desc`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (!data.files) {
        renderError("No files found or error fetching files.");
        return;
      }
      renderFiles(data.files);
    } catch (e) {
      renderError("Error fetching files.");
      console.error(e);
    }
  }

  function renderError(message) {
    const container = document.createElement("div");
    container.style.padding = "20px";
    container.style.fontFamily = "sans-serif";
    container.style.textAlign = "center";
    container.style.background = "rgba(255,255,255,0.6)";
    container.style.borderRadius = "10px";
    container.textContent = message;
    document.body.innerHTML = "";
    document.body.appendChild(container);
  }

  function renderFiles(files) {
    const filtered = files.filter(file => /^\d{2}-\d{4}-.+/.test(file.name)); // MM-YYYY-title

    const container = document.createElement("div");
    container.style.display = "grid";
    container.style.gridTemplateColumns = "repeat(3, 1fr)";
    container.style.gap = "16px";
    container.style.padding = "20px";
    container.style.maxHeight = "90vh";
    container.style.overflowY = "auto";
    container.style.background = "rgba(255,255,255,0.6)";
    container.style.borderRadius = "10px";

    if (filtered.length === 0) {
      renderError("No valid files found matching naming pattern.");
      return;
    }

    filtered.forEach(file => {
      const parts = file.name.split("-");
      const datePart = parts[0] + "-" + parts[1];
      let titlePart = parts.slice(2).join("-");
      titlePart = titlePart.replace(/\.[^/.]+$/, ""); // remove extension

      if (file.thumbnailLink) {
        // Thumbnail card - clickable whole card, no text
        const card = document.createElement("a");
        card.className = "card";
        card.href = file.webViewLink;
        card.target = "_blank";
        card.rel = "noopener noreferrer";

        const img = document.createElement("img");
        img.className = "card-img";
        img.src = getHighResThumbnail(file.thumbnailLink);
        img.alt = titlePart;

        card.appendChild(img);
        container.appendChild(card);

      } else {
        // Fallback card with date, title, and download button
        const card = document.createElement("div");
        card.className = "card-fallback";

        const date = document.createElement("div");
        date.textContent = datePart;
        date.className = "fallback-date";

        const title = document.createElement("div");
        title.textContent = titlePart;
        title.className = "fallback-title";

        const download = document.createElement("a");
        download.href = file.webViewLink;
        download.target = "_blank";
        download.rel = "noopener noreferrer";
        download.textContent = "Download";
        download.className = "fallback-download";

        card.appendChild(date);
        card.appendChild(title);
        card.appendChild(download);
        container.appendChild(card);
      }
    });

    document.body.innerHTML = "";
    document.body.appendChild(container);
  }

  fetchFiles();
}
