let nodes;
let isExtensionActive = false;

function updateButtonState() {
  const toggleButton = document.getElementById("toggle-extension");
  if (!toggleButton) return;

  toggleButton.textContent = isExtensionActive ? "Desactiver" : "Activer";
  if (isExtensionActive) {
    toggleButton.style.backgroundColor = "#ef4444";
  } else {
    toggleButton.style.backgroundColor = "#3b82f6";
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

    chrome.storage.local.get(["isActive"], function (result) {
      try {
        console.log("Callback storage.get exécuté");
        isExtensionActive = result.isActive === true;
        console.log("État initial de l'extension:", isExtensionActive);

        updateButtonState();
        messageDiv.textContent = isExtensionActive
          ? "Extension active"
          : "Extension inactive";
        messageDiv.style.color = isExtensionActive ? "#10b981" : "#ef4444";

        // Envoyer l'état à tous les onglets pour appliquer les styles CSS
        chrome.tabs.query({}, function (tabs) {
          tabs.forEach(function (tab) {
            chrome.tabs.sendMessage(tab.id, {
              action: "updateState",
              isActive: isExtensionActive,
            });
          });
        });

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

        chrome.storage.local.set({ isActive: isExtensionActive }, function () {
          try {
            console.log("État sauvegardé:", isExtensionActive);

            updateButtonState();
            messageDiv.textContent = isExtensionActive
              ? "Extension active"
              : "Extension inactive";
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

async function onWindowLoad() {
  let aiResponse;

  chrome.tabs
    .query({ active: true, currentWindow: true })
    .then(function (tabs) {
      const activeTab = tabs[0];
      const activeTabId = activeTab.id;

      // Injecter le CSS dans la page web
      chrome.scripting
        .insertCSS({
          target: { tabId: activeTabId },
          files: ["censored-content.css"],
        })
        .catch((error) => {
          console.error("Erreur lors de l'injection CSS:", error);
        });

      return chrome.scripting.executeScript({
        target: { tabId: activeTabId },
        func: getHTMLNodes,
      });
    })
    .then(async function (results) {
      if (!results || results.length === 0) {
        console.log("Aucun résultat reçu");
        return;
      }

      nodes = results[0].result;
      console.log("Nodes récupérés :", nodes);
      let response = "";

      for (i = 0; i < nodes.length; i++) {
        response += nodes[i];
      }

      response = JSON.stringify({ text: response });

      console.log("Reponse : " + response);

      //   const url = "http://localhost:5083/Censorship/censor";

      //   let json_response = await fetch(url, {
      //     method: "POST",
      //     body: response,
      //     headers: {
      //       "Content-Type": "application/json",
      //       Accept: "application/json",
      //     },
      //   });

      //   if (json_response.status !== 200) {
      //     console.error("Erreur lors de la requête:", json_response.statusText);
      //     return;
      //   }

      //   let json = await json_response.json();
      //   console.log("Réponse JSON:", json);

      chrome.tabs
        .query({ active: true, currentWindow: true })
        .then(function (tabs) {
          const activeTab = tabs[0];
          const activeTabId = activeTab.id;

          chrome.scripting.executeScript({
            target: { tabId: activeTabId },
            func: replaceNodes,
            args: [
              [
                {
                  originalContent:
                    "Encore un pseudo-intellectuel qui se vante de ses lectures... Tu sais, Netflix existe",
                  censorContent:
                    "Chacun ses passions, mais je préfère Netflix personnellement",
                  severity: "low",
                },
                {
                  originalContent:
                    "Alex t'es trop nul au foot. Tu devrais arreter le foot. T'es inutile!",
                  censorContent:
                    "Alex, peut-être que le foot n'est pas ton point fort, mais chacun a ses talents.",
                  severity: "medium",
                },
                {
                  originalContent:
                    "Laisse-le tranquille @AbdelOgz, c'est pas de sa faute si t'es frustré de ta propre nullité !",
                  censorContent:
                    "Laisse-le tranquille @AbdelOgz, chacun a ses moments difficiles.",
                  severity: "medium",
                },
                {
                  originalContent:
                    "MDR la vérité fait mal mais Abdel a raison, Alex est juste bon à réchauffer le banc",
                  censorContent:
                    "MDR, chacun a ses forces, mais peut-être qu'Alex peut s'améliorer avec le temps",
                  severity: "low",
                },
                {
                  originalContent:
                    "Encore une qui poste des photos de nature pour faire croire qu'elle a une vie interessante...",
                  censorContent:
                    "Chacun partage ce qu'il aime, et la nature peut être inspirante",
                  severity: "low",
                },
                {
                  originalContent:
                    "Super, encore une écolo qui va nous faire la leçon sur comment sauver la planète...",
                  censorContent:
                    "C'est bien de voir des gens partager leur passion pour la nature et l'environnement.",
                  severity: "low",
                },
                {
                  originalContent:
                    "Retourne dans ton pays @AbdelOgz, ton n'a pas besoin de gens comme toi ici!",
                  censorContent:
                    "Ce genre de propos est inapproprié. Respectons les autres, peu importe leur origine.",
                  severity: "high",
                },
                {
                  originalContent:
                    "Franchement Jordan a raison, on peut plus rien dire dans ce pays sans qu'on nous censure",
                  censorContent:
                    "Il est important de discuter avec respect, même si les opinions diffèrent",
                  severity: "medium",
                },
                {
                  originalContent:
                    "J'ai vu ton site... On dirait un projet de collégien. T'appelles ça un design ?",
                  censorContent:
                    "J'ai vu ton site, peut-être qu'il y a des points à améliorer, mais c'est un bon début !",
                  severity: "low",
                },
                {
                  originalContent:
                    "Encore un 'développeur' qui pense révolutionner le web avec un template WordPress... Pathétique.",
                  censorContent:
                    "C'est bien de voir des gens partager leurs projets, même si ce n'est pas parfait.",
                  severity: "low",
                },
              ],
              isExtensionActive,
            ],
          });
        });
    })
    .catch(function (error) {
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
    textContent = textContent.replace(/\s+/g, " ");

    nodes.push(textContent);
  }

  return nodes;
}

function correctText(text) {
  const corrections = {
    terminer: "pas utile",
    nul: "fort",
  };

  for (let [bad, good] of Object.entries(corrections)) {
    text = text.replace(new RegExp(`\\b${bad}\\b`, "gi"), good);
  }

  return text;
}

function replaceNodes(correctionsArray, isActive) {
  console.log("Corrections reçues:", correctionsArray);

  if (!isActive) return;

  // Collecter tous les nœuds texte d'abord
  const textNodes = [];
  const treeWalker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  let node;
  while ((node = treeWalker.nextNode())) {
    if (node.nodeValue.trim()) {
      textNodes.push(node);
    }
  }

  // Traiter chaque nœud texte
  textNodes.forEach((node) => {
    let text = node.nodeValue;
    let nodeModified = false;

    for (const correction of correctionsArray) {
      if (
        correction &&
        correction.originalContent &&
        correction.censorContent &&
        !nodeModified // Éviter de retraiter un nœud déjà modifié
      ) {
        const decodedContent = decodeURIComponent(
          escape(correction.originalContent)
        );
        if (text.includes(decodedContent)) {
          nodeModified = true;
          const censorText = decodeURIComponent(
            escape(correction.censorContent)
          );
          const severity = correction.severity || "low";

          // Créer un conteneur pour le texte censuré et son remplacement
          const container = document.createElement("div");
          container.className = `censorship-container severity-${severity}`;

          // Créer un span pour le texte censuré avec animation
          const censoredSpan = document.createElement("div");
          censoredSpan.className = "censored-text";
          censoredSpan.textContent = decodedContent;

          // Créer un span pour le texte de remplacement avec animation
          const replacementSpan = document.createElement("div");
          replacementSpan.className = "replacement-text";
          replacementSpan.textContent = censorText;

          // Ajouter les éléments au conteneur
          container.appendChild(censoredSpan);
          container.appendChild(replacementSpan);

          if (node.parentNode) {
            // Texte avant le contenu censuré
            const beforeText = text.substring(0, text.indexOf(decodedContent));
            if (beforeText) {
              node.parentNode.insertBefore(
                document.createTextNode(beforeText),
                node
              );
            }

            // Insérer le conteneur
            node.parentNode.insertBefore(container, node);

            // Texte après le contenu censuré
            const afterText = text.substring(
              text.indexOf(decodedContent) + decodedContent.length
            );
            if (afterText) {
              node.parentNode.insertBefore(
                document.createTextNode(afterText),
                node
              );
            }

            // Supprimer le nœud texte original
            node.parentNode.removeChild(node);
          }
        }
      }
    }
  });
}
