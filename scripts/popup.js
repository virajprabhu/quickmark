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

function changeIconCallback() {
	if (chrome.runtime.lastError) {
		console.log(chrome.runtime.lastError.message);
	} else {
		// tab exists, do nothing
	}
}

// initalize jquery-ui autocomplete
function initAutocomplete(folderArr) {

	// create bookmark folder and bookmark current url to it
	function createBookmarkFolder(title) {
		chrome.bookmarks.create({
			title: title
		}, function (result) {
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				chrome.bookmarks.create({
					parentId: result.id,
					title: tabs[0].title,
					url: tabs[0].url
				});
			});
		});
	}

	// make create prompt visible on no results
	$("#create-link-container").click(function() {
		var title = $("#tags").val();
		createBookmarkFolder(title);
	});

	// searches folderArr by name and returns id if found
	function findFolderId(folderName) {
		var idArr = $.grep(folderArr, function(e) {
			return e.value === folderName;
		});
		if (idArr.length === 0) {
			return -1;
		}
		return idArr[0].id;
	}

	var isSelected = false;

	// init jquery autocomplete
	$("#tags").autocomplete({
		minLength: 0,
		source: folderArr,

		// display create prompt if no folder matching query found
		response: function(event, ui) {
			if (ui.content.length === 0) {
				$("#create-link-container").css("display", "inline-block");
			} else {
				$("#create-link-container").css("display", "none");
			}
		},

		// on select, create bookmark in chosen folder
		select: function(event, ui) {
			isSelected = true;
			var selectedFolderValue = $(event.target).val(ui.item.value)[0].value;
			var selectedFolderId = findFolderId(selectedFolderValue);
			// console.log(selectedFolderId + " : " + selectedFolderValue);
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				chrome.bookmarks.create({
					parentId: selectedFolderId,
					title: tabs[0].title, 
					url: tabs[0].url 
				});
				// todo: change image on success
				// chrome.browserAction.setIcon({
				// 	path: "resources/images/quickmarked.png",
				// 	tabId: tabs[0].id
				// }, changeIconCallback);
			});			
		}
	});
}

// pass autocomplete init as callback
getFolderArr(initAutocomplete);
