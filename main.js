console.log("DOM Content loaded")

// When to load this efficiently?

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
						opened: tab.opened,
						openFor: diff
					}

					console.log(storageObj[tab.id])

				} else {
					console.log("Doesnt have tab", tab)
					storageObj[tab.id] = { 
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
	
}
setupTabStorage()


