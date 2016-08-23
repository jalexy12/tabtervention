// MS
var TIME_LIMIT = 864000000
var OLD_THRESHHOLD = 259200000
var FINE_THRESHHOLD = 86400000

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

			chrome.storage.local.set({tabs: storageObj}, function(){ console.log("Saved!")})
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
			}
		}

		chrome.storage.local.set({tabs: newObj}, function(){
			console.log("Updated!")
		})
		console.log(newObj)
		updateDomWithTabs(newObj)
	})

}

function updateDomWithTabs(tabs){
	var classified = {
		aboutToExpire: [],
		older: [],
		fine: []
	}

	for (var key in tabs){
		var currentTab = tabs[key]

		if (currentTab.openFor <= FINE_THRESHHOLD){
			classified.fine.push(currentTab)
		} else if(currentTab.openFor > FINE_THRESHHOLD && currentTab.openFor <= OLD_THRESHHOLD){
			classified.older.push(currentTab)
		} else {
			classified.aboutToExpire.push(currentTab)
		}
	}


	for (var classification in classified){
		classified[classification].forEach(function(tab){
			var appendTo = document.getElementById(classification)
			var newLi = document.createElement("li")
			newLi.appendChild(document.createTextNode(tab.title))
			appendTo.appendChild(newLi)
		})
	}
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

