const bookmarkName = document.getElementById("bookmark-name");
const bookmarkUrl = document.getElementById("bookmark-url");
const bookmarkTag = document.getElementById("bookmark-tag");
const addBookmarkBtn = document.getElementById("add-bookmark");
const bookmarkList = document.getElementById("bookmark-list");
const archiveList = document.getElementById("archive-list");
const clearArchiveBtn = document.getElementById("clear-archive");
const archiveContainer = document.querySelector(".archive-container");
const toggleArchiveBtn = document.getElementById("toggle-archive");
const searchInput = document.getElementById("search-input");

// Sort buttons
const sortAlphabeticalAscBtn = document.getElementById("sort-alphabetical-asc");
const sortAlphabeticalDescBtn = document.getElementById("sort-alphabetical-desc");
const sortDateNewestBtn = document.getElementById("sort-date-newest");
const sortDateOldestBtn = document.getElementById("sort-date-oldest");

// Current sort mode
let currentSortMode = "important"; // default sort by important

// Initial load
document.addEventListener("DOMContentLoaded", () => {
  renderBookmarks();
  loadArchive();
  attachSortListeners();
});

//function when add bookmark button is clicked
addBookmarkBtn.addEventListener("click", function () {
  const name = bookmarkName.value.trim();
  const url = bookmarkUrl.value.trim();
  const tag = bookmarkTag ? bookmarkTag.value.trim() : ""; //checks if tag input exists

  //validation if name and url are provided
  if (!name || !url) {
    alert("Please enter both a name and a URL.");
    return;
  }

  // URL validation
  if (!url.startsWith("https://") && !url.startsWith("http://")) {
    alert("Please enter a valid URL");
    return;
  }

  addBookmark(name, url, false, tag); //add to display
  saveBookmark(name, url, false, tag); //save to local storage

  //clear input fields
  bookmarkName.value = "";
  bookmarkUrl.value = "";
  if (bookmarkTag) bookmarkTag.value = "";
});

// Search functionality
if (searchInput) {
  searchInput.addEventListener('input', function () {
    const q = searchInput.value.trim();
    renderBookmarks(q); // rerender bookmarks with filter
  });
}

// add bookmark to display
function addBookmark(name, url, important = false, tag = "") {
  //create elements
  const li = document.createElement("li");
  const link = document.createElement("a");

  // set link attributes and content
  link.href = url;
  link.textContent = name;
  link.target = "_blank";

  //check and add tag if exists
  if (tag) {
    const tagSpan = document.createElement('span');
    tagSpan.classList.add('bookmark-tag');
    tagSpan.textContent = tag;
    link.appendChild(document.createTextNode(' '));
    link.appendChild(tagSpan);
  }

  //Important button
  const importantButton = document.createElement("button");
  importantButton.textContent = important ? "★" : "☆";
  //toggle important status
  importantButton.addEventListener("click", function () {
    important = !important;
    importantButton.textContent = important ? "★" : "☆";

    // Update important status in local storage
    const bookmarks = getBookmarksFromStorage();
    const bookmarkIndex = bookmarks.findIndex(
      (b) => b.name === name && b.url === url,
    );
    if (bookmarkIndex !== -1) {
      bookmarks[bookmarkIndex].important = important;
      localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    }

    // Re-render bookmarks to reflect changes after toggling important
    renderBookmarks();
  });

  //Archive button
  const archiveButton = document.createElement("button");
  archiveButton.textContent = "Archive";
  // functionality for clicking archive
  archiveButton.addEventListener("click", function () {
    if (li.parentElement === bookmarkList) bookmarkList.removeChild(li); // check if parent is bookmarkList before removing
    // remove from bookmarks and add to archive including tag
    const bookmarks = getBookmarksFromStorage();
    const idx = bookmarks.findIndex(b => b.name === name && b.url === url);
    const currentTag = idx !== -1 ? (bookmarks[idx].tag || "") : tag; // get current tag from bookmarks or fallback to provided tag
    removeBookmarksFromStorage(name, url);
    saveArchive(name, url, currentTag);
    addArchiveItem(name, url, currentTag);
  });

  // Tag / Edit Tag button
  const tagButton = document.createElement('button');
  tagButton.textContent = tag ? 'Edit Tag' : 'Add Tag'; // change text based on existing tag
  // functionality for clicking tag button
  tagButton.addEventListener('click', function () {
    const newTag = prompt('Enter tag (leave blank to remove):', tag || '');
    if (newTag === null) return; // cancelled
    // Update tag in local storage
    const bookmarks = getBookmarksFromStorage();
    const bookmarkIndex = bookmarks.findIndex(
      (b) => b.name === name && b.url === url,
    );
    if (bookmarkIndex !== -1) {
      bookmarks[bookmarkIndex].tag = newTag.trim();
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    }
    renderBookmarks();
  });

  //adding of control div (Important + Archive Buttons)
  const controls = document.createElement("div");
  controls.classList.add("bookmark-controls");
  controls.appendChild(importantButton);
  controls.appendChild(archiveButton);
  controls.appendChild(tagButton);

  //append link and controls to list item
  li.appendChild(link);
  li.appendChild(controls);

  //append list item to bookmark list
  bookmarkList.appendChild(li);
}

// get bookmarks from local storage
function getBookmarksFromStorage() {
  const bookmarks = localStorage.getItem("bookmarks");
  return bookmarks ? JSON.parse(bookmarks) : [];
}

// save bookmark to local storage
function saveBookmark(name, url, important = false, tag = "") {
  const bookmarks = getBookmarksFromStorage();
  bookmarks.push({ name, url, important, tag, addedAt: new Date().toISOString() });
  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
}

// render bookmarks with or without filter
function renderBookmarks(filter = "") {
  bookmarkList.innerHTML = ""; //clear existing list
  const bookmarks = getBookmarksFromStorage(); //get bookmarks from storage

  // apply sorting based on current sort mode
  applySorting(bookmarks);

  //filter and display bookmarks
  const q = filter ? filter.toLowerCase() : ""; // normalize filter

  // checks first if filter is empty then filters by name or tag
  bookmarks
    .filter(b => !q || (b.name && b.name.toLowerCase().includes(q)) || (b.tag && b.tag.toLowerCase().includes(q)))
    .forEach(b => addBookmark(b.name, b.url, b.important, b.tag || ""));
  }


// remove bookmark from local storage
function removeBookmarksFromStorage(name, url) {
  let bookmarks = getBookmarksFromStorage();
  bookmarks = bookmarks.filter(
    (bookmark) => bookmark.name !== name || bookmark.url !== url,
  );
  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
}

// get archive from local storage
function getArchiveFromStorage() {
  const archived = localStorage.getItem("archive");
  return archived ? JSON.parse(archived) : [];
}

// save archived bookmark to local storage
function saveArchive(name, url, tag = "") {
  const archive = getArchiveFromStorage();
  archive.push({ name, url, tag, archivedAt: new Date().toISOString() });
  localStorage.setItem("archive", JSON.stringify(archive));
}

// load archived bookmarks on page load
function loadArchive() {
  const archive = getArchiveFromStorage();
  archive.forEach((item) => {
    addArchiveItem(item.name, item.url, item.tag || "");
  });
}

// add archived bookmark to display
function addArchiveItem(name, url, tag = "") {

  //create elements
  const li = document.createElement("li");
  const link = document.createElement("a");

  // set link attributes and content
  link.href = url;
  link.textContent = name;
  link.target = "_blank";

  //check and add tag if exists
  if (tag) {
    const tagSpan = document.createElement('span');
    tagSpan.classList.add('bookmark-tag');
    tagSpan.textContent = tag;
    link.appendChild(document.createTextNode(' '));
    link.appendChild(tagSpan);
  }

  //controls div for Restore and Delete buttons
  const controls = document.createElement("div");

  // Restore button
  const restoreButton = document.createElement("button");
  restoreButton.textContent = "Restore";
  restoreButton.addEventListener("click", function () {
    removeArchiveFromStorage(name, url, tag);
    if (li.parentElement === archiveList) archiveList.removeChild(li);
    addBookmark(name, url, false, tag);
    saveBookmark(name, url, false, tag);
  });

  // Delete button
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", function () {
    if (!confirm("Permanently delete this archived bookmark?")) return;
    removeArchiveFromStorage(name, url, tag);
    if (li.parentElement === archiveList) archiveList.removeChild(li);
  });

  // append buttons to controls div
  controls.appendChild(restoreButton);
  controls.appendChild(deleteButton);

  //append link and controls to list item
  li.appendChild(link);
  li.appendChild(controls);
  archiveList.appendChild(li);
}

// remove archived bookmark from local storage
function removeArchiveFromStorage(name, url, tag = undefined) {
  let archive = getArchiveFromStorage();
  archive = archive.filter((item) => {
    const same = item.name === name && item.url === url;
    if (!same) return true;
    if (tag === undefined) return false;
    return item.tag !== tag;
  });
  localStorage.setItem("archive", JSON.stringify(archive));
}

//clear entire archive
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

// attach sort button listeners
function attachSortListeners() {
  if (sortAlphabeticalAscBtn) {
    sortAlphabeticalAscBtn.addEventListener("click", function () {
      currentSortMode = "alphabetical-asc";
      renderBookmarks(searchInput.value);
    });
  }

  if (sortAlphabeticalDescBtn) {
    sortAlphabeticalDescBtn.addEventListener("click", function () {
      currentSortMode = "alphabetical-desc";
      renderBookmarks(searchInput.value);
    });
  }

  if (sortDateNewestBtn) {
    sortDateNewestBtn.addEventListener("click", function () {
      currentSortMode = "date-newest";
      renderBookmarks(searchInput.value);
    });
  }

  if (sortDateOldestBtn) {
    sortDateOldestBtn.addEventListener("click", function () {
      currentSortMode = "date-oldest";
      renderBookmarks(searchInput.value);
    });
  }
}

// apply sorting based on current sort mode
function applySorting(bookmarks) {
  switch (currentSortMode) {
    case "alphabetical-asc":
      bookmarks.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "alphabetical-desc":
      bookmarks.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "date-newest":
      bookmarks.sort((a, b) => {
        const dateA = new Date(a.addedAt || 0);
        const dateB = new Date(b.addedAt || 0);
        return dateB - dateA;
      });
      break;
    case "date-oldest":
      bookmarks.sort((a, b) => {
        const dateA = new Date(a.addedAt || 0);
        const dateB = new Date(b.addedAt || 0);
        return dateA - dateB;
      });
      break;
    default:
      // default: important bookmarks first
      bookmarks.sort((a, b) => b.important - a.important);
  }
}
