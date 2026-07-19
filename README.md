# 商家网站 · Shangjia Wangzhan

商家网站生成与品牌发布前端。

## 文件

- `index.html` — 主页面
- `styles.css` — 平台样式
- `script.js` — 生成器、预览、分享与付款连接
- `config.js` — 正式域名、后端地址和价格显示
- `privacy.html` — 隐私政策
- `terms.html` — 服务条款
- `acceptable-use.html` — 使用规范
- `report.html` — 举报入口

## 正式地址

`https://shangjiawangzhan.com`

## 后端连接

在 `config.js` 中填写 Stripe 后端公开地址：

```js
window.SJW_CONFIG = {
  siteUrl: "https://shangjiawangzhan.com",
  apiBase: "https://shangjiawangzhan-stripe-api.onrender.com",
  currency: "USD",
  monthlyDisplay: "$15",
  yearlyDisplay: "$149",
  supportEmail: "shangjiawangzhan@gmail.com"
};
```

## 版本

V1.0
