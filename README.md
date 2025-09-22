# AI協働型マインドマップ（MVP）

創作アイデアを素早く発散・整理できるマインドマップアプリ。React Flow による直感的な編集と、将来的な AI 提案連携（LLM）を前提に設計しています。

## 概要
- フロント: Next.js 15（React 19）
- 可視化/編集: React Flow（D3/ELK は将来の自動レイアウトに利用）
- デプロイ: Vercel（GitHub Actions による自動デプロイ）
- 仕様と計画: `UX_MINDMAP_SPEC.md`, `PROJECT_DOCUMENTATION.md`

## ディレクトリ構成（抜粋）
```
repo-root/
├─ frontend/                     # Next.js（Vercel）
│  ├─ src/app/page.tsx
│  ├─ package.json
│  ├─ next.config.ts
│  ├─ tsconfig.json
│  ├─ .vercelignore (任意)
│  └─ README.md (任意)
├─ .cursor/                      # Cursor MCP 設定（プロジェクト固有）
│  └─ mcp.json
├─ .github/workflows/vercel-deploy.yml
├─ vercel.json                   # RootDirectory=frontend
├─ PROJECT_DOCUMENTATION.md
├─ UX_MINDMAP_SPEC.md
├─ CONTRIBUTING.md
└─ README.md                     # このファイル
```

## ローカル開発
前提: Node.js 22系、npm 10 以上

```bash
cd frontend
npm install
npm run dev
# http://localhost:3000 へアクセス
```

操作（現時点のMVP）
- ダブルクリック: ノード追加
- ドラッグ: ノード移動／エッジハンドルで接続
- ツールバー: JSONエクスポート/インポート、クリア

## デプロイ（Vercel 自動）
- ブランチ `main` への push で本番（`--prod`）デプロイ
- その他のブランチ/PR は Preview デプロイ
- 事前に GitHub Secrets を設定
  - `VERCEL_TOKEN`（`https://vercel.com/account/tokens`）
  - `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID`（`npx vercel link --cwd frontend` 実行後の `.vercel/project.json` より）

関連ファイル:
- `.github/workflows/vercel-deploy.yml`
- `vercel.json`（Root Directory を `frontend` に固定）

## 環境変数
- フロント（任意）: `NEXT_PUBLIC_BACKEND_URL`（バックエンド接続時に使用予定）
  - Vercel の Project Settings > Environment Variables で設定

## コーディング規約・貢献
- バックエンド実装ルール（重複機能クラスの禁止）: `PROJECT_DOCUMENTATION.md` / `CONTRIBUTING.md`
- フロントエンド: TypeScript strict、ESLint/Prettier（追加予定）

## ロードマップ（抜粋）
- キャンバス基本操作の拡充（矩形選択、ショートカット、Undo/Redo）
- ノードラベルのインライン編集、コンテキストメニュー
- 自動レイアウト（ELK もしくは d3-hierarchy）
- ローカル保存・PNG エクスポートの強化
- バックエンド CRUD/API、AI 提案（LLM）連携

## ライセンス
TBD
