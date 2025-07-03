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
  showMessage("No folder specified in URL.<br>Use ?folder=evaluation or another folder name.");
} else {
  const API_KEY = "AIzaSyAf8fcQDvfOsuRATtYR9ftdSijNfO4uBPs";

  async function fetchFiles() {
    const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+trashed=false&key=${API_KEY}&fields=files(id,name,createdTime,webViewLink)&orderBy=createdTime desc`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (!data.files) {
        showMessage("No files found or error fetching files.");
        return;
      }
      renderFiles(data.files);
    } catch (e) {
      showMessage("Error fetching files.");
      console.error(e);
    }
  }

  function showMessage(message) {
    const container = document.createElement("div");
    container.className = "message-box";
    container.innerHTML = message;
    document.body.innerHTML = "";
    document.body.appendChild(container);
  }

  function createContainer() {
    const container = document.createElement("div");
    container.className = "container";
    return container;
  }

  function renderFiles(files) {
    const filtered = files.filter(file => /^\d{2}-\d{2}-.+/.test(file.name));
    const container = createContainer();

    if (filtered.length === 0) {
      const msg = document.createElement("p");
      msg.textContent = "No valid files found matching naming pattern.";
      msg.style.gridColumn = "1 / -1";
      msg.style.textAlign = "center";
      msg.style.fontFamily = "sans-serif";
      msg.style.color = "#666";
      msg.style.fontSize = "1.2rem";
      container.appendChild(msg);
      document.body.innerHTML = "";
      document.body.appendChild(container);
      return;
    }

    filtered.forEach(file => {
      let parts = file.name.split("-");
      let datePart = parts[0] + "-" + parts[1];
      let titlePart = parts.slice(2).join("-");

      const card = document.createElement("div");
      card.className = "flashcard";

      const date = document.createElement("div");
      date.className = "flashcard-date";
      date.textContent = datePart;

      const title = document.createElement("div");
      title.className = "flashcard-title";
      title.textContent = titlePart;

      const download = document.createElement("a");
      download.href = file.webViewLink;
      download.target = "_blank";
      download.rel = "noopener noreferrer";
      download.className = "download-btn";
      download.textContent = "Download";

      card.appendChild(date);
      card.appendChild(title);
      card.appendChild(download);

      container.appendChild(card);
    });

    document.body.innerHTML = "";
    document.body.appendChild(container);
  }

  fetchFiles();
}
