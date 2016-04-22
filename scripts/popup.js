// populate array of all bookmark folders and
// then initialize jquery-ui autocomplete
function getFolderArr(callback) {
	var folderArr = [];
	function getBookmarks(bookmarks) {
		bookmarks.forEach(function(bookmark) {
			if (bookmark.children) {
				folderArr.push(bookmark.title);
				getBookmarks(bookmark.children);
			}
		});
	}
	chrome.bookmarks.getTree(function(bookmarks) {
		getBookmarks(bookmarks);
		callback(folderArr);
	});
}


// initalize jquery-ui autocomplete
function initAutocomplete(folderArr) {
	$(".selector").autocomplete({
		minLength: 0,
		source: folderArr
	});	
}

getFolderArr(initAutocomplete);