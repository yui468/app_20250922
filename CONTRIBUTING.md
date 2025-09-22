# 貢献ガイドライン（Backend）

## 重複機能クラスの禁止
- 同じ責務・振る舞いのクラスを増やさないでください
- 既存の `service`/`util`/`mapper` を再利用し、差分は拡張/委譲/抽象化で吸収します
- 似たロジックが2箇所に現れたら、最短で共通化するPRを用意してください

### 設計指針
- 単一責任（SRP）と明確な命名（`*Service`, `*Repository`, `*Mapper`）
- 共通ユースケースはドメインサービスに集約
- パターン活用: Strategy / Template Method / Composition / Port-Adapter

### PRチェックリスト（抜粋）
- [ ] 既存クラスの再利用/拡張で代替不可か
- [ ] 同等のメソッド群や条件分岐が重複していないか
- [ ] 共通化候補を分離し、テストを付与したか

### 自動検出（導入方針）
- PMD CPD による重複検出をCIに追加予定（`backend/src` を対象）
- しきい値案: 70 tokens / 重複ブロック
- 除外方針: DTO/レコード等のボイラープレートは対象外

## コーディング規約（Frontend参考は別途）
- TypeScript strict / ESLint / Prettier

## コミット/PR
- Conventional Commits を推奨（feat, fix, refactor, docs, test, chore）
- 小さくレビュー可能な単位でPRを作成
