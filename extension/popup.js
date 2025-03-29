let nodes;
let isExtensionActive = false;

function updateButtonState() {
    const toggleButton = document.getElementById("toggle-extension");
    if (!toggleButton) return;
    
    toggleButton.textContent = isExtensionActive ? "Desactiver" : "Activer";
    if (isExtensionActive) {
        toggleButton.style.backgroundColor = "#ef4444"; // Rouge pour désactiver
    } else {
        toggleButton.style.backgroundColor = "#3b82f6"; // Bleu pour activer
    }
}

document.addEventListener("DOMContentLoaded", function () {
    try {
        const toggleButton = document.getElementById("toggle-extension");
        if (!toggleButton) {
            console.error("Élément toggle-extension introuvable!");
            return;
        }
        const messageDiv = document.getElementById("message");
        if (!messageDiv) {
            console.error("Élément message introuvable!");
            return;
        }
        
        console.log("Éléments DOM récupérés avec succès");
        
        // Récupérer l'état de l'extension depuis le stockage
        chrome.storage.local.get(['isActive'], function(result) {
            try {
                console.log("Callback storage.get exécuté");
                isExtensionActive = result.isActive === true;
                console.log("État initial de l'extension:", isExtensionActive);
                
                // Mettre à jour l'interface
                updateButtonState();
                messageDiv.textContent = isExtensionActive ? "Extension active" : "Extension inactive";
                messageDiv.style.color = isExtensionActive ? "#10b981" : "#ef4444";
                
                // Si l'extension est active, exécuter la fonction principale
                if (isExtensionActive) {
                    onWindowLoad();
                }
            } catch (innerError) {
                console.error("Erreur dans le callback storage:", innerError);
            }
        });

        toggleButton.addEventListener("click", function () {
            try {
                isExtensionActive = !isExtensionActive;
                console.log("Nouvel état de l'extension:", isExtensionActive);
                
                // Sauvegarder l'état
                chrome.storage.local.set({isActive: isExtensionActive}, function() {
                    try {
                        console.log("État sauvegardé:", isExtensionActive);
                        
                        // Mise à jour de l'interface
                        updateButtonState();
                        messageDiv.textContent = isExtensionActive ? "Extension active" : "Extension inactive";
                        messageDiv.style.color = isExtensionActive ? "#10b981" : "#ef4444";

                        if (isExtensionActive) {
                            onWindowLoad();
                        }
                    } catch (innerError) {
                        console.error("Erreur dans le callback storage.set:", innerError);
                    }
                });
            } catch (clickError) {
                console.error("Erreur dans l'event click:", clickError);
            }
        });
    } catch (error) {
        console.error("Erreur générale dans DOMContentLoaded:", error);
    }
});

function onWindowLoad() {
    chrome.tabs.query({ active: true, currentWindow: true }).then(function (tabs) {
        const activeTab = tabs[0];
        const activeTabId = activeTab.id;

        return chrome.scripting.executeScript({
            target: { tabId: activeTabId },
            func: getHTMLNodes,
        });
    }).then(async function (results) {
        if (!results || results.length === 0) {
            console.log("Aucun résultat reçu");
            return;
        }
        
        nodes = results[0].result;
        console.log("Nodes récupérés :", nodes);

        chrome.tabs.query({ active: true, currentWindow: true }).then(function (tabs) {
            const activeTab = tabs[0];
            const activeTabId = activeTab.id;

            chrome.scripting.executeScript({
                target: { tabId: activeTabId },
                func: replaceNodes,
                args: [{
                    "inutile": "pas utile",
                    "nul": "fort"
                }, isExtensionActive], // Passer l'état comme argument
            });
        });
    }).catch(function (error) {
        console.log("Erreur :", error.message);
    });
}

function getHTMLNodes() {
    const nodes = [];
    let nodeId = 0;

    const treeWalker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_ELEMENT
    );

    while (treeWalker.nextNode()) {
        const currentNode = treeWalker.currentNode;
        console.log("Current node : " + currentNode.textContent)
        let textContent = currentNode.textContent.trim();
        textContent = textContent.replace(/\s+/g, ' ');

        if (textContent) {
            currentNode.setAttribute("data-node-id", nodeId);
            nodes.push({ id: nodeId, text: textContent });
            nodeId++;
        }
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

function replaceNodes(corrections, isActive) {
    // Utiliser isActive passé en argument au lieu de isExtensionActive global
    if (!isActive) return;

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