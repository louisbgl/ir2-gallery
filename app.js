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

if (!folderId) {
  document.body.innerHTML = "<p style='padding:20px; font-family: sans-serif;'>No folder specified in URL.<br>Use ?folder=evaluation or another folder name.</p>";
} else {
  const API_KEY = "AIzaSyAf8fcQDvfOsuRATtYR9ftdSijNfO4uBPs";

  async function fetchFiles() {
    const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+trashed=false&key=${API_KEY}&fields=files(id,name,createdTime,webViewLink)&orderBy=createdTime desc`;
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
    container.className = "container";
    container.textContent = message;
    document.body.innerHTML = "";
    document.body.appendChild(container);
  }

  function renderFiles(files) {
    // Match MM-YYYY-TITLE pattern
    const filtered = files.filter(file => /^\d{2}-\d{4}-.+/.test(file.name));

    if (filtered.length === 0) {
      renderError("No valid files found matching naming pattern.");
      return;
    }

    const container = document.createElement("div");
    container.className = "container";

    filtered.forEach(file => {
      const parts = file.name.split("-");
      const datePart = parts[0] + "-" + parts[1];
      // Remove extension from title:
      let titlePart = parts.slice(2).join("-");
      titlePart = titlePart.replace(/\.[^/.]+$/, "");

      const card = document.createElement("div");
      card.className = "card";

      const dateEl = document.createElement("div");
      dateEl.className = "card-date";
      dateEl.textContent = datePart;

      const titleEl = document.createElement("div");
      titleEl.className = "card-title";
      titleEl.textContent = titlePart;

      const downloadBtn = document.createElement("a");
      downloadBtn.className = "card-download";
      downloadBtn.href = file.webViewLink;
      downloadBtn.target = "_blank";
      downloadBtn.rel = "noopener noreferrer";
      downloadBtn.textContent = "Download";

      card.appendChild(dateEl);
      card.appendChild(titleEl);
      card.appendChild(downloadBtn);

      container.appendChild(card);
    });

    document.body.innerHTML = "";
    document.body.appendChild(container);
  }

  fetchFiles();
}
