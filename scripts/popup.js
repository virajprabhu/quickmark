// populate array of all bookmark folders and
// then initialize jquery-ui autocomplete
function getFolderArr(callback) {
	var folderArr = [];
	// recursively collect bookmark folders, top down
	function getBookmarks(bookmarks) {
		bookmarks.forEach(function(bookmark) {
			if (bookmark.children) {
				folderArr.push({
					value: bookmark.title,
					id: bookmark.id
				});
				getBookmarks(bookmark.children);
			}
		});
	}
	// chrome bookmarks api to get entire bookmarktreenode tree
	chrome.bookmarks.getTree(function(bookmarks) {
		getBookmarks(bookmarks);
		callback(folderArr);
	});
}


// initalize jquery-ui autocomplete
function initAutocomplete(folderArr) {
	// folderArr.forEach(function(folder) {
	// 	console.log(folder.id + " : " + folder.value);
	// });
	var isSelected = false;
	$("#tags").autocomplete({
		minLength: 0,
		source: folderArr,
		select: function(event, ui) {
			isSelected = true;
			var selectedFolderValue = $(event.target).val(ui.item.value)[0].value;
			var selectedFolderId = $.grep(folderArr, function(e) {
				return e.value === selectedFolderValue;
			})[0].id;
			// console.log(selectedFolderId + " : " + selectedFolderValue);
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				chrome.bookmarks.create({
					parentId: selectedFolderId,
					title: tabs[0].title, 
					url: tabs[0].url 
				});
				// chrome.browserAction.setIcon({path: icon});
			})			
		}
	});
}

// pass autocomplete init as callback
getFolderArr(initAutocomplete);

