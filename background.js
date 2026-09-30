// メニュー ID と、それぞれがどのタイトル種別をコピーするかの対応。
// - "page": document.title をそのまま使う（既存の挙動）
// - "issue": GitHub Issue ページのタイトル（"... · Issue #N · owner/repo" から抽出）
// - "pr":    GitHub Pull Request ページのタイトル
const MENU_ISSUE_ID = "copy-markdown-link-issue";
const MENU_PR_ID = "copy-markdown-link-pr";
const MENU_PAGE_ID = "copy-markdown-link";

const MENU_KIND_BY_ID = {
  [MENU_PAGE_ID]: "page",
  [MENU_ISSUE_ID]: "issue",
  [MENU_PR_ID]: "pr",
};

chrome.runtime.onInstalled.addListener(() => {
  // 既存メニュー（全ページ）
  chrome.contextMenus.create({
    id: MENU_PAGE_ID,
    title: "Copy as Markdown Link",
    contexts: ["page", "link"],
  });

  // GitHub Issue ページでのみ表示される。documentUrlPatterns により Chrome が
  // 自動で表示を出し分けるため、タブ URL の監視は不要。
  chrome.contextMenus.create({
    id: MENU_ISSUE_ID,
    title: "Copy as Markdown Link (Issue Title)",
    contexts: ["page", "link"],
    documentUrlPatterns: ["https://github.com/*/issues/*"],
  });

  // GitHub Pull Request ページでのみ表示される。
  chrome.contextMenus.create({
    id: MENU_PR_ID,
    title: "Copy as Markdown Link (PR Title)",
    contexts: ["page", "link"],
    documentUrlPatterns: ["https://github.com/*/pull/*"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const kind = MENU_KIND_BY_ID[info.menuItemId];
  if (!kind) return;

  if (!tab || tab.id == null) {
    console.error("[Copy as Markdown Link] No active tab to copy from.");
    return;
  }

  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      func: copyMarkdownLink,
      args: [kind],
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

function copyMarkdownLink(kind) {
  // GitHub の <title> は "<タイトル> · Issue #N · owner/repo" /
  // "<タイトル> · Pull Request #N · owner/repo" の形式。
  // 末尾の " · Issue #N · owner/repo" 部分を取り除いて純粋なタイトルを得る。
  const extractGitHubTitle = () => {
    const raw = document.title;
    const marker = / · (?:Issue|Pull Request) #\d+ · /;
    const idx = raw.search(marker);
    return idx === -1 ? raw : raw.slice(0, idx);
  };

  const rawTitle =
    kind === "issue" || kind === "pr" ? extractGitHubTitle() : document.title;

  const title = rawTitle.replace(/\[/g, "\\[").replace(/\]/g, "\\]");
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
