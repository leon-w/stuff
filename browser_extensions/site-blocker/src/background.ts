const patterns: RegExp[] = [];

function loadPatterns() {
    chrome.storage.local.get(["urlPatterns"], result => {
        if (result.urlPatterns) {
            // clear the patterns array
            patterns.length = 0;

            for (const line of result.urlPatterns.split("\n")) {
                const pattern = line.trim();
                if (pattern.startsWith("#")) {
                    continue;
                }

                const re = new RegExp(pattern.replace(/([.?+^$[\]\\(){}|/-])/g, "\\$1").replace(/\*/g, ".*"));
                patterns.push(re);
            }
        }
    });
}

chrome.runtime.onMessage.addListener(request => {
    if (request.type === "blocklist_update") {
        loadPatterns();
    }
});

chrome.tabs.onUpdated.addListener((tabId, _, tab) => {
    const url = tab.url;
    if (url) {
        if (patterns.some(pattern => pattern.test(url))) {
            // Close the tab
            chrome.tabs
                .remove(tabId)
                .then(() => {
                    chrome.notifications.create({
                        type: "basic",
                        iconUrl: chrome.runtime.getURL("icon.png"),
                        title: "Site Blocked!",
                        message: `${url} has been blocked.`,
                    });
                })
                .catch(() => void 0); // Ignore errors
        }
    }
});

loadPatterns();
