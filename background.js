chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "copy-markdown-link",
    title: "Copy as Markdown Link",
    contexts: ["page", "link"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== "copy-markdown-link") return;

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: copyMarkdownLink,
  });
});

function copyMarkdownLink() {
  const title = document.title.replace(/\[/g, "\\[").replace(/\]/g, "\\]");
  const url = location.href;
  const markdown = `[${title}](${url})`;

  navigator.clipboard.writeText(markdown).then(() => {
    const msg = document.createElement("div");
    msg.textContent = "Markdownリンクをコピーしました。";
    Object.assign(msg.style, {
      position: "fixed",
      top: "16px",
      right: "16px",
      zIndex: "2147483647",
      background: "#323232",
      color: "#fff",
      padding: "10px 18px",
      borderRadius: "6px",
      fontSize: "14px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      transition: "opacity 0.4s",
      opacity: "1",
    });
    document.body.appendChild(msg);

    setTimeout(() => {
      msg.style.opacity = "0";
      setTimeout(() => msg.remove(), 400);
    }, 1800);
  });
}
