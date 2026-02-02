const bookmarkName = document.getElementById("bookmark-name");
const bookmarkUrl = document.getElementById("bookmark-url");
const addBookmarkBtn = document.getElementById("add-bookmark");
const bookmarkList = document.getElementById("bookmark-list");
const archiveList = document.getElementById("archive-list");
const clearArchiveBtn = document.getElementById("clear-archive");
const archiveContainer = document.querySelector(".archive-container");
const toggleArchiveBtn = document.getElementById("toggle-archive");

document.addEventListener("DOMContentLoaded", () => {
  loadBookmarks();
  loadArchive();
});

addBookmarkBtn.addEventListener("click", function () {
  const name = bookmarkName.value.trim();
  const url = bookmarkUrl.value.trim();

  if (!name || !url) {
    alert("Please enter both a name and a URL.");
    return;
  }

  if (!url.startsWith("https://") && !url.startsWith("http://")) {
    alert("Please enter a valid URL");
    return;
  }

  addBookmark(name, url);
  saveBookmark(name, url);

  bookmarkName.value = "";
  bookmarkUrl.value = "";
});

function addBookmark(name, url, important = false) {
  const li = document.createElement("li");
  const link = document.createElement("a");

  link.href = url;
  link.textContent = name;
  link.target = "_blank";

  //Important button
  const importantButton = document.createElement("button");
  importantButton.textContent = important ? "★" : "☆";
  importantButton.addEventListener("click", function () {
    important = !important;
    importantButton.textContent = important ? "★" : "☆";

    const bookmarks = getBookmarksFromStorage();
    const bookmarkIndex = bookmarks.findIndex(
      (b) => b.name === name && b.url === url,
    );
    if (bookmarkIndex !== -1) {
      bookmarks[bookmarkIndex].important = important;
      localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    }
    renderBookmarks();
  });

  //Archive button
  const archiveButton = document.createElement("button");
  archiveButton.textContent = "Archive";
  archiveButton.addEventListener("click", function () {
    if (li.parentElement === bookmarkList) bookmarkList.removeChild(li);
    removeBookmarksFromStorage(name, url);
    saveArchive(name, url);
    addArchiveItem(name, url);
  });

  //Control Div (Important + Archive Buttons)
  const controls = document.createElement("div");
  controls.classList.add("bookmark-controls");
  controls.appendChild(importantButton);
  controls.appendChild(archiveButton);

  li.appendChild(link);
  li.appendChild(controls);
  bookmarkList.appendChild(li);
}

function getBookmarksFromStorage() {
  const bookmarks = localStorage.getItem("bookmarks");
  return bookmarks ? JSON.parse(bookmarks) : [];
}

function saveBookmark(name, url, important = false) {
  const bookmarks = getBookmarksFromStorage();
  bookmarks.push({ name, url, important });
  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
}

function loadBookmarks() {
  const bookmarks = getBookmarksFromStorage();

  bookmarks.sort((a, b) => b.important - a.important);

  bookmarks.forEach((b) => addBookmark(b.name, b.url, b.important));
}

function renderBookmarks() {
  bookmarkList.innerHTML = "";
  const bookmarks = getBookmarksFromStorage();

  bookmarks.sort((a, b) => b.important - a.important);

  bookmarks.forEach((b) => addBookmark(b.name, b.url, b.important));
}

function removeBookmarksFromStorage(name, url) {
  let bookmarks = getBookmarksFromStorage();
  bookmarks = bookmarks.filter(
    (bookmark) => bookmark.name !== name || bookmark.url !== url,
  );
  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
}

// Archive functions
function getArchiveFromStorage() {
  const archived = localStorage.getItem("archive");
  return archived ? JSON.parse(archived) : [];
}

function saveArchive(name, url) {
  const archive = getArchiveFromStorage();
  archive.push({ name, url, archivedAt: new Date().toISOString() });
  localStorage.setItem("archive", JSON.stringify(archive));
}

function loadArchive() {
  const archive = getArchiveFromStorage();
  archive.forEach((item) => {
    addArchiveItem(item.name, item.url);
  });
}

function addArchiveItem(name, url) {
  const li = document.createElement("li");
  const link = document.createElement("a");
  link.href = url;
  link.textContent = name;
  link.target = "_blank";

  const controls = document.createElement("div");

  const restoreButton = document.createElement("button");
  restoreButton.textContent = "Restore";
  restoreButton.addEventListener("click", function () {
    removeArchiveFromStorage(name, url);
    if (li.parentElement === archiveList) archiveList.removeChild(li);
    addBookmark(name, url);
    saveBookmark(name, url);
  });

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", function () {
    if (!confirm("Permanently delete this archived bookmark?")) return;
    removeArchiveFromStorage(name, url);
    if (li.parentElement === archiveList) archiveList.removeChild(li);
  });

  controls.appendChild(restoreButton);
  controls.appendChild(deleteButton);

  li.appendChild(link);
  li.appendChild(controls);
  archiveList.appendChild(li);
}

function removeArchiveFromStorage(name, url) {
  let archive = getArchiveFromStorage();
  archive = archive.filter((item) => item.name !== name || item.url !== url);
  localStorage.setItem("archive", JSON.stringify(archive));
}

if (clearArchiveBtn) {
  clearArchiveBtn.addEventListener("click", function () {
    if (!confirm("Clear entire archive?")) return;
    localStorage.removeItem("archive");
    archiveList.innerHTML = "";
  });
}

//archive toggle
if (toggleArchiveBtn && archiveContainer) {
  toggleArchiveBtn.addEventListener("click", function () {
    archiveContainer.classList.toggle("visible");
    toggleArchiveBtn.textContent = archiveContainer.classList.contains(
      "visible",
    )
      ? "Hide Archive"
      : "Show Archive";
  });
}
