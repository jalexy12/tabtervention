// Todo:

// MS
var TIME_LIMIT = 864000000
var OLD_THRESHOLD = 259200000
var FINE_THRESHOLD = 86400000

// On Tab Open
chrome.tabs.onCreated.addListener(function(tab){
	var tabOpenedOn = (new Date()).getTime()
	var tabId = tab.id;
	var tabTitle = tab.title;
	addToTabStorage(tabId, tabTitle, tabOpenedOn)
})

function addToTabStorage(tabId, tabTitle, tabOpenedOn){
	chrome.storage.local.get("tabs", function(res){
		var tabList = res.tabs;
		var current = (new Date()).getTime();
		var diff = current - tabOpenedOn;

		// Adds new tab to the list of tabs
		tabList[tabId] = {
			title: tabTitle,
			opened: tabOpenedOn,
			openFor: diff
		}

		chrome.storage.local.set({tabs: tabList}, function(){ console.log("Saved!")})
	})
}

// On Tab Closed
chrome.tabs.onRemoved.addListener(function(tabId, res){
	removeFromTabStorage(tabId);
})

function removeFromTabStorage(tabId){
	chrome.storage.local.get("tabs", function(res){
		var tabList = res.tabs

		// Use this to check count before deletion
		// alert("before: " + Object.keys(tabList).length);
		for (var key in tabList) {
			if (tabId == key) {
				// Removes element by key
				delete tabList[key];
			}
		}

		// Use this to check count after deletion
		// alert("after: " + Object.keys(tabList).length);
		chrome.storage.local.set({tabs: tabList}, function(){ console.log("Saved!")})
	})
}


// Tab storage setup
function setupTabStorage(){
	chrome.storage.local.get("tabs", function(res){
		var storageObj = res.tabs || {}

		chrome.tabs.query({}, function(currentTabs){
			currentTabs.forEach(function(tab){
				if (storageObj[tab.id]){
					console.log("Has Tab", tab)
					var foundTab = storageObj[tab.id]
					var openedOn = foundTab.opened
					var current = (new Date()).getTime()
					var diff = current - openedOn

					storageObj[tab.id] = {
						title: tab.title,
						opened: foundTab.opened,
						openFor: diff
					}

					console.log(storageObj[tab.id])

				} else {
					console.log("Doesnt have tab", tab)
					storageObj[tab.id] = {
						title: tab.title,
						opened: (new Date()).getTime(),
						openFor: 0
					}
					console.log(storageObj[tab.id])
				}
			})
			// storageObj["lastPing"] = Date.now()
			chrome.storage.local.set({tabs: storageObj}, function(){ console.log("Saved!")})
			// updateClassifiedTabs(storageObj)
		})
	})
}

function checkIfOld(){

	chrome.storage.local.get("tabs", function(res){
		var newObj = {}
		for (var key in res.tabs) {
			if (Number(res.tabs[key].openFor) < TIME_LIMIT){
				newObj[key] = res.tabs[key]
				var opened = newObj[key].opened
				var current = (new Date()).getTime()
				newObj[key].openFor = current - opened
			} else {
				console.log("Time To Close...", res.tabs[key])
				// Convert the key to an integer before passing it to the remove function
				chrome.tabs.remove(Number(key), function(){
					console.log("Removed Tab")
				})

			}
		}

		// newObj["lastPing"] = Date.now()
		chrome.storage.local.set({tabs: newObj}, function(){
			console.log("Updated!")
		})
	})

}

function cleanUp(){
	chrome.storage.local.clear()
	chrome.alarms.clearAll()
}

function init(){
	setupTabStorage()
	chrome.alarms.create("tabCheck", {when: Date.now() + 60000, periodInMinutes: 1})
}

chrome.alarms.onAlarm.addListener(function(alarm){
	if (alarm.name === "tabCheck"){
		checkIfOld()
	}
})

chrome.runtime.onInstalled.addListener(init)
chrome.runtime.onStartup.addListener(init)
chrome.runtime.onSuspend.addListener(cleanUp)
chrome.runtime.onSuspendCanceled.addListener(init)
chrome.runtime.onConnect.addListener(function(){
	console.log("Connected...?")
})

init()