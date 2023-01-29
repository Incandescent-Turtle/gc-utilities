chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request)
    {
        switch(request.action)
        {
            case "create_tab":
                openTab()
                break
        }
        return true
    }
})

chrome.action.onClicked.addListener(tab => {
    openTab()
})

function openTab()
{
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        chrome.tabs.create({
            url: chrome.runtime.getURL("utility_tab/landing.html"),
            openerTabId: tabs[0].id
        });
    });
}