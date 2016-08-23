var OLD_THRESHHOLD = 259200000
var FINE_THRESHHOLD = 86400000

chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (key in changes) {
    var storageChange = changes[key];
    console.log('Storage key "%s" in namespace "%s" changed. ' +
                'Old value was "%s", new value is "%s".',
                key,
                namespace,
                storageChange.oldValue,
                storageChange.newValue);
  }
});

document.addEventListener("DOMContentLoaded", function(){
	chrome.storage.local.get("tabs", function(res){
		var classified = {
			aboutToExpire: [],
			older: [],
			fine: []
		}
		
		for (var key in res.tabs){
			var currentTab = res.tabs[key]

			if (currentTab.openFor <= FINE_THRESHHOLD){
				classified.fine.push(currentTab)
			} else if(currentTab.openFor > FINE_THRESHHOLD && currentTab.openFor <= OLD_THRESHHOLD){
				classified.older.push(currentTab)
			} else {
				classified.aboutToExpire.push(currentTab)
			}
		}

		updateDom(classified)
		chrome.storage.local.set({classifiedTabs: classified})
	})
})


function updateDom(classified){
	for (var category in classified){
		var list = document.getElementById(category)
		console.log(list)
		classified[category].forEach(function(tab){
			var li = document.createElement("li")
			li.className += "tab-li"
			var title = tab.title || "Unknown"
			li.appendChild(document.createTextNode(title))
			list.appendChild(li)
		})
	}
}
