export function replaceBulletsWithCheck(html) {
  if (!html) return "";
  const customIcon = `<img src="/custom-bullet.png" alt="icon" style="width:16px;height:16px;display:inline;margin-right:8px;vertical-align:middle;" />`;

  // Use DOMParser to parse the HTML string
  const parser = new window.DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
  const root = doc.body.firstChild;

  // Helper to process only top-level <li> in a list
  function processList(list, isNested = false) {
    for (const li of list.children) {
      if (li.tagName === "LI") {
        if (!isNested) {
          // Only add icon if not already present
          if (!li.innerHTML.trim().startsWith(customIcon)) {
            li.innerHTML = customIcon + li.innerHTML;
          }
        }
        // Recursively process nested lists inside this <li>
        for (const child of li.children) {
          if (child.tagName === "UL" || child.tagName === "OL") {
            processList(child, true);
          }
        }
      }
    }
  }

  // Find all top-level <ul> or <ol> and process their <li>
  for (const list of root.children) {
    if (list.tagName === "UL" || list.tagName === "OL") {
      processList(list, false);
    }
  }

  return root.innerHTML;
}
