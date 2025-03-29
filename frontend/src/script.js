function getHTMLNodes() {
  const nodes = [];

  const treeWalker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_ELEMENT
  );

  while (treeWalker.nextNode()) {
    if (/[^\s]/.test(treeWalker.currentNode.textContent)) {
      nodes.push(treeWalker.currentNode.textContent);
    }
  }

  return nodes;
}

const nodes = getHTMLNodes();
console.log(nodes);
