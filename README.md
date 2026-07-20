# 商家网站前端 v2.0

公开轻客户端，仅负责商家输入、图片上传、后端请求、预览展示和支付跳转。

## 正式地址

- Website: `https://shangjiawangzhan.com`
- API: `https://api.shangjiawangzhan.com`

## 安全边界

- 不包含行业映射、模板、Prompt、SEO、Schema 或网站生成逻辑。
- 图片仅接受 JPG、PNG、WebP。
- API 请求有超时和重复提交保护。
- 预览地址与 Stripe 跳转地址执行白名单检查。
- Cloudflare Pages 使用 `_headers` 提供 CSP 和基础安全响应头。

后端仍须实施身份验证、Stripe 权限确认、限速、上传文件签名检查、输入过滤和 Webhook 签名验证。
