// モジュールの読み込み
var createError = require('http-errors');  // httpエラーの対処を行うためのもの
var express = require('express');  // expressそのもの
var path = require('path');  // ファイルパスを扱うためのもの
var cookieParser = require('cookie-parser');  // クッキーのパースに関するもの
// クッキーとは「アクセスするそれぞれの人ごとに保管されるデータ」で、サーバーから送られてきた値を保管しておくための仕組み
var logger = require('morgan');  // httpリクエストのログ出力に関するもの

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const catalogRouter = require("./routes/catalog"); // Add import routes for "catalog" area of site
const compression = require("compression");  // レスポンスに圧縮を使用する
const helmet = require("helmet");  // 既知の脆弱性から保護するために使用する

// Create the Express application object
const app = express();

// Set up rate limiter: maximum of twenty requests per minute
// APIルートにレート制限を追加する
const RateLimit = require("express-rate-limit");
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
  validate: {xForwardedForHeader: false}, // disable ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
});
// Apply rate limiter to all requests
app.use(limiter);

// Add helmet to the middleware chain.
// Set CSP headers to allow our Bootstrap and Jquery to be served
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "script-src": ["'self'", "code.jquery.com", "cdn.jsdelivr.net"],
    },
  }),
);

// Set up mongoose connection
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGODB_URI; // hide password

main().catch((err) => console.log(err));
async function main() {
  // await mongoose.connect(mongoDB);
  await mongoose.connect(mongoDB, { connectTimeoutMS: 30000 }); // Operation `~` buffering timed out after 10000ms. (無関係かも)
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));  // テンプレートファイルが保管される場所を設定
// __dirname: 現在実行中のソースコードが格納されているディレクトリパスが格納されている
app.set('view engine', 'pug');  // pugをテンプレートエンジンに指定

// モジュールの組み込み
app.use(logger('dev'));
app.use(express.json());
// Body-Parserを基にExpressに組み込まれた機能
// クライアントから送信されたデータをreq.body経由で取得、操作できる
// リクエストオブジェクトを JSONオブジェクト として認識する
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression()); // Compress all routes
app.use(express.static(path.join(__dirname, 'public')));  // イメージ、CSS ファイル、JavaScript ファイルなどの静的ファイルを提供する

// routing
app.use('/', indexRouter);  // 「/」にアクセスした場合は「index.js」を実行
app.use('/users', usersRouter);  // 「/users」にアクセスした場合は、「users.js」を実行
app.use("/catalog", catalogRouter); // Add catalog routes to middleware chain.

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404, "Not Found"));
  // same code
  // var err = new Error("Not Found");
  // err.status = 404;
  // next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Export the Express application object
module.exports = app;
