let nodes;

function onWindowLoad() {
    chrome.tabs.query({ active: true, currentWindow: true }).then(function (tabs) {
        var activeTab = tabs[0];
        var activeTabId = activeTab.id;

        return chrome.scripting.executeScript({
            target: { tabId: activeTabId },
            func: getHTMLNodes,
        });

    }).then(function (results) {
        nodes = results[0].result;
        console.log("Nodes récupérés :", nodes);

        chrome.tabs.query({ active: true, currentWindow: true }).then(function (tabs) {
            var activeTab = tabs[0];
            var activeTabId = activeTab.id;

            chrome.scripting.executeScript({
                target: { tabId: activeTabId },
                func: replaceNodes,
                args: [nodes],
            });
        });
    }).catch(function (error) {
        console.log("Error : " + error.message);
    });
}

function DOMtoString(selector) {
    if (selector) {
        selector = document.querySelector(selector);
        if (!selector) return "ERROR: querySelector failed to find node"
    } else {
        selector = document.documentElement;
    }
    return selector.outerHTML;
}

function getHTMLNodes() {
    const nodes = [];
    let nodeId = 0; // Compteur pour générer des IDs uniques

    const treeWalker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_ELEMENT
    );

    while (treeWalker.nextNode()) {
        const currentNode = treeWalker.currentNode;
        let textContent = currentNode.textContent.trim();
        textContent = textContent.replace(/\s+/g, ' ');

        if (textContent) {
            // Ajoute un ID unique au nœud
            currentNode.setAttribute("data-node-id", nodeId);
            nodes.push({ id: nodeId, text: textContent });
            nodeId++;
        }
    }

    return nodes;
}

function replaceNodes(newNodes) {
    newNodes.forEach(node => {
        // Trouve le nœud correspondant par son ID
        const currentNode = document.querySelector(`[data-node-id="${node.id}"]`);
        if (currentNode) {
            // Remplace uniquement le contenu texte du nœud
            currentNode.textContent = node.text;
        }
    });
}

onWindowLoad();