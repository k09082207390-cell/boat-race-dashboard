# BOAT RACE AI COPY - SIMPLE

目的は1つだけです。

1. 日付・場・レースを選択
2. 「5ページを取得」
3. 5ページ取得成功を確認
4. 「AI用データをコピー」
5. ChatGPTへ貼って予想

取得対象:
- 基本情報
- 枠別勝率
- モータ情報
- 今節成績
- 直前情報

## 配置

GitHub Pages:
- index.html
- style.css
- app.js

Cloudflare Worker:
- worker.js

app.js の WORKER_BASE は既存Worker URL:
https://boat-race-api.k09082207390.workers.dev

Workerを別URLにした場合だけ WORKER_BASE を変更してください。

## テストURL

Worker Deploy後:

https://boat-race-api.k09082207390.workers.dev/health

AI PACK:

https://boat-race-api.k09082207390.workers.dev/api?hiduke=20260809&place_no=18&race_no=12&mode=ai-pack-simple

成功時:
- successCount: 5
- expectedCount: 5

フロントでは「5/5 取得成功」と表示されます。
