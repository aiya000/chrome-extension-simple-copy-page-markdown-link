chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "copy-markdown-link",
    title: "Copy as Markdown Link",
    contexts: ["page", "link"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== "copy-markdown-link") return;

  if (!tab || tab.id == null) {
    console.error("[Copy as Markdown Link] No active tab to copy from.");
    return;
  }

  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      func: copyMarkdownLink,
    },
    () => {
      // executeScript 自体が失敗した場合（chrome:// ページ、PDF、Web Store など）
      if (chrome.runtime.lastError) {
        console.error(
          "[Copy as Markdown Link] Failed to inject script:",
          chrome.runtime.lastError.message
        );
      }
    }
  );
});

function copyMarkdownLink() {
  const title = document.title.replace(/\[/g, "\\[").replace(/\]/g, "\\]");
  const url = location.href;
  const markdown = `[${title}](${url})`;

  const showToast = (text, isError) => {
    const toast = document.createElement("div");

    if (isError) {
      toast.textContent = text;
    } else {
      // コピー成功時は、コピーした内容そのものを表示する
      const label = document.createElement("div");
      label.textContent = text;
      Object.assign(label.style, {
        marginBottom: "6px",
        fontWeight: "bold",
      });

      const content = document.createElement("div");
      content.textContent = markdown;
      Object.assign(content.style, {
        fontFamily: "monospace",
        wordBreak: "break-all",
        opacity: "0.9",
      });

      toast.appendChild(label);
      toast.appendChild(content);
    }

    Object.assign(toast.style, {
      position: "fixed",
      top: "16px",
      right: "16px",
      zIndex: "2147483647",
      maxWidth: "360px",
      background: isError ? "#b3261e" : "#323232",
      color: "#fff",
      padding: "10px 18px",
      borderRadius: "6px",
      fontSize: "14px",
      lineHeight: "1.4",
      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      transition: "opacity 0.4s",
      opacity: "1",
    });
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 400);
    }, isError ? 3000 : 2500);
  };

  // navigator.clipboard が失敗したときのフォールバック
  const fallbackCopy = () => {
    const textarea = document.createElement("textarea");
    textarea.value = markdown;
    Object.assign(textarea.style, {
      position: "fixed",
      top: "-9999px",
      left: "-9999px",
      opacity: "0",
    });
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (e) {
      ok = false;
    }
    textarea.remove();
    return ok;
  };

  const onError = (reason) => {
    console.error("[Copy as Markdown Link] Copy failed:", reason);
    showToast("コピーに失敗しました。ページを一度クリックしてから再試行してください。", true);
  };

  // navigator.clipboard が使えない環境（非セキュアコンテキスト等）はフォールバックへ
  if (!navigator.clipboard || !navigator.clipboard.writeText) {
    if (fallbackCopy()) {
      showToast("Markdownリンクをコピーしました。", false);
    } else {
      onError("clipboard API unavailable and execCommand failed");
    }
    return;
  }

  navigator.clipboard.writeText(markdown).then(
    () => {
      showToast("Markdownリンクをコピーしました。", false);
    },
    (err) => {
      // 失敗したらフォールバックを試す
      if (fallbackCopy()) {
        showToast("Markdownリンクをコピーしました。", false);
      } else {
        onError(err);
      }
    }
  );
}
