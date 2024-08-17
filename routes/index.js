var express = require('express');
var router = express.Router();

// /* GET home page. */
// router.get('/', function(req, res, next) {
//   // テンプレート変数 "title" を渡した "index" テンプレート (Pug) を使用
//   // レスポンスをレンダリング
//   res.render('index', { title: 'Express' });
//   // index.pug に記載されている title に対応して 'Express' が挿入される
// });

// GET home page.
router.get("/", function (req, res) {
  res.redirect("/catalog");
});

module.exports = router;
