# Chrome Extension - Simple Copy Page Markdown Link

最も単純なプラグイン。
現在開いているページを `[ページタイトル](URL)` の Markdown 形式でクリップボードにコピーする**だけの** Chrome 拡張機能です。

## 使い方

ページ上で右クリック → **「Copy as Markdown Link」** を選択するとコピーされます。

コピー成功時は画面右上にトースト通知が表示されます。

### リンクあり / リンクなし

各メニューには「リンクあり」と「リンクなし」の 2 系統があります。

- **Copy as Markdown Link**: `[ページタイトル](URL)` の Markdown リンク形式でコピーします
- **Copy as Markdown Title**: ページタイトルの**文字列だけ**をコピーします（URL なし）

### GitHub の Issue / Pull Request ページ

GitHub の Issue / Pull Request ページでは、右クリックメニューに次の項目が追加で表示されます。

- Issue ページ（`https://github.com/*/issues/*`）
    - **「Copy as Markdown Link (Issue Title)」**（リンクあり）
    - **「Copy as Markdown (Issue Title)」**（リンクなし・タイトルのみ）
- Pull Request ページ（`https://github.com/*/pull/*`）
    - **「Copy as Markdown Link (PR Title)」**（リンクあり）
    - **「Copy as Markdown (PR Title)」**（リンクなし・タイトルのみ）

これらは、ページタイトル末尾の `· Issue #N · owner/repo` のような接尾辞を取り除いた**純粋な Issue / PR タイトル**を使います。

例（リンクあり）:

- ページタイトル: `Fix the login bug · Issue #42 · owner/repo`
- コピーされる内容: `[Fix the login bug](https://github.com/owner/repo/issues/42)`

例（リンクなし）:

- ページタイトル: `Fix the login bug · Issue #42 · owner/repo`
- コピーされる内容: `Fix the login bug`

## インストール手順

1. このリポジトリをクローン（またはダウンロード）する
2. Chrome のアドレスバーに `chrome://extensions` と入力して開く
3. 右上の **「デベロッパーモード」** をオンにする
4. **「パッケージ化されていない拡張機能を読み込む」** をクリックする
5. このリポジトリのフォルダを選択する
6. 拡張機能一覧に「Copy as Markdown Link」が追加されれば完了
