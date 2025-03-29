let nodes;

function onWindowLoad() {
    chrome.tabs.query({ active: true, currentWindow: true }).then(function (tabs) {
        const activeTab = tabs[0];
        const activeTabId = activeTab.id;

        return chrome.scripting.executeScript({
            target: { tabId: activeTabId },
            func: getHTMLNodes,
        });
    }).then(async function (results) {
        nodes = results[0].result;
        console.log("Nodes récupérés :", nodes);
        response = ''

        for (i = 0; i < nodes.length; i++) {
            response += nodes[i].text
        }

        console.log("Reponse : " + response)

        //const replacements = await sendToAI(nodes);

        //console.log("Suggestions de remplacement :", replacements);

        chrome.tabs.query({ active: true, currentWindow: true }).then(function (tabs) {
            const activeTab = tabs[0];
            const activeTabId = activeTab.id;

            chrome.scripting.executeScript({
                target: { tabId: activeTabId },
                func: replaceNodes,
                args: [{
                    extension: "pas utile",
                    nul: "fort"
                }],
            });
        });
    }).catch(function (error) {
        console.log("Erreur :", error.message);
    });
}

function getHTMLNodes() {
    const nodes = [];

    const treeWalker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_ELEMENT
    );

    while (treeWalker.nextNode()) {
        const currentNode = treeWalker.currentNode;
        let textContent = currentNode.textContent.trim();
        textContent = textContent.replace(/\s+/g, ' ');

        nodes.push(textContent)
    }

    return nodes;
}

function correctText(text) {
    const corrections = {
        "inutile": "pas utile",
        "nul": "fort"
    }

    for (let [bad, good] of Object.entries(corrections)) {
        text = text.replace(new RegExp(`\\b${bad}\\b`, 'gi'), good);
    }

    return text
}

function replaceNodes(corrections) {
    const treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);

    let node;
    while ((node = treeWalker.nextNode())) {
        let text = node.nodeValue;
        for (let [bad, good] of Object.entries(corrections)) {
            text = text.replace(new RegExp(`\\b${bad}\\b`, 'gi'), good);
        }
        node.nodeValue = text;
    }
}

onWindowLoad();