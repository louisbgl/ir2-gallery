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

  // Function to fetch files from the folder
  async function fetchFiles() {
    const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+trashed=false&key=${API_KEY}&fields=files(id,name,createdTime,webViewLink)&orderBy=createdTime desc`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (!data.files) {
        document.body.innerHTML = "<p>No files found or error fetching files.</p>";
        return;
      }
      renderFiles(data.files);
    } catch (e) {
      document.body.innerHTML = "<p>Error fetching files.</p>";
      console.error(e);
    }
  }

  // Function to render the flashcards
  function renderFiles(files) {
    // Filter files to match "xx-xx-TITLE" pattern (e.g. "03-24-MyDoc.pdf")
    const filtered = files.filter(file => /^\d{2}-\d{2}-.+/.test(file.name));

    if (filtered.length === 0) {
      document.body.innerHTML = "<p>No valid files found matching naming pattern.</p>";
      return;
    }

    const container = document.createElement("div");
    container.style.display = "grid";
    container.style.gridTemplateColumns = "repeat(3, 1fr)";
    container.style.gap = "16px";
    container.style.padding = "20px";
    container.style.overflowY = "auto";
    container.style.maxHeight = "90vh";

    filtered.forEach((file, i) => {
      // Parse date and title from filename
      let parts = file.name.split("-");
      let datePart = parts[0] + "-" + parts[1];
      let titlePart = parts.slice(2).join("-");

      const card = document.createElement("div");
      card.style.border = "1px solid #ccc";
      card.style.borderRadius = "8px";
      card.style.padding = "16px";
      card.style.fontFamily = "sans-serif";
      card.style.background = "#fafafa";
      card.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
      card.style.display = "flex";
      card.style.flexDirection = "column";
      card.style.justifyContent = "space-between";
      card.style.height = "200px";

      const title = document.createElement("h3");
      title.textContent = `IR2 test ${i + 1}: ${titlePart}`;
      title.style.fontSize = "1.1rem";
      title.style.margin = "0 0 10px 0";
      title.style.flexGrow = "1";

      const date = document.createElement("p");
      date.textContent = `Date: ${datePart}`;
      date.style.margin = "0 0 10px 0";
      date.style.color = "#555";

      const download = document.createElement("a");
      download.href = file.webViewLink;
      download.target = "_blank";
      download.rel = "noopener noreferrer";
      download.textContent = "Download";
      download.style.textDecoration = "none";
      download.style.color = "#007BFF";
      download.style.fontWeight = "bold";
      download.style.alignSelf = "flex-start";
      download.style.marginTop = "auto";

      card.appendChild(title);
      card.appendChild(date);
      card.appendChild(download);

      container.appendChild(card);
    });

    document.body.innerHTML = "";
    document.body.appendChild(container);
  }

  fetchFiles();
}
