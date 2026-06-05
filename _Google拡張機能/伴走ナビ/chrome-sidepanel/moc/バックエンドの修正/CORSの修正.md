## 修正方法（サーバー側・必須）
192.168.1.229 の /var/www/html/node-db-api/index.js を次のように変更

```javascript
require("./register-aliases");

const express = require("express");
const routes = require("@/routes");
const cors = require("cors");
const path = require("path");


// ポート番号は環境変数で指定できるように
const PORT = process.env.PORT || 3001;

const app = express();
// app.use(cors()) // 全てのオリジンを許可

app.use(
  cors({
    origin: function (origin, callback) {
      // same-network / local 開発用
      if (!origin) return callback(null, true);

      // 192.168.x.x / localhost を許可
      if (
        origin.startsWith("http://192.168.") ||
        origin.startsWith("http://localhost") ||
        origin.startsWith("chrome-extension://")  // ← 追加
      ) {
        return callback(null, true);
      }

      // それ以外は拒否
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);


app.use(express.json()); // JSONリクエストを受け取る

// ルーティング登録
app.use("/api", routes);

// "public" フォルダを公開
app.use('/public', express.static(path.join(__dirname, 'public')));

// サーバー起動
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running at http://0.0.0.0:${PORT}`);
});

```