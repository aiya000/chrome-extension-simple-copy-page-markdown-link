# Chrome Extension - Simple Copy Page Markdown Link

最も単純なプラグイン。
現在開いているページを `[ページタイトル](URL)` の Markdown 形式でクリップボードにコピーする**だけの** Chrome 拡張機能です。

## 使い方

ページ上で右クリック → **「Copy as Markdown Link」** を選択するとコピーされます。

コピー成功時は画面右上にトースト通知が表示されます。

### GitHub の Issue / Pull Request ページ

GitHub の Issue / Pull Request ページでは、右クリックメニューに次の項目が追加で表示されます。

- Issue ページ（`https://github.com/*/issues/*`）: **「Copy as Markdown Link (Issue Title)」**
- Pull Request ページ（`https://github.com/*/pull/*`）: **「Copy as Markdown Link (PR Title)」**

これらは、ページタイトル末尾の `· Issue #N · owner/repo` のような接尾辞を取り除いた**純粋な Issue / PR タイトル**をリンクテキストにしてコピーします。

例:

- ページタイトル: `Fix the login bug · Issue #42 · owner/repo`
- コピーされる内容: `[Fix the login bug](https://github.com/owner/repo/issues/42)`

## インストール手順

1. このリポジトリをクローン（またはダウンロード）する
2. Chrome のアドレスバーに `chrome://extensions` と入力して開く
3. 右上の **「デベロッパーモード」** をオンにする
4. **「パッケージ化されていない拡張機能を読み込む」** をクリックする
5. このリポジトリのフォルダを選択する
6. 拡張機能一覧に「Copy as Markdown Link」が追加されれば完了
