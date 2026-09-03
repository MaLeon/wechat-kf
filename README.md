# wechat-kf (OpenClaw Channel Plugin)

基于 [`@pawastation/wechat-kf`](https://github.com/pawastation/wechat-kf) v0.3.2 二次开发的 OpenClaw 微信客服(企业微信客服)Channel 插件,已适配本环境并包含 Webhook 路径修复。

## 与上游的差异(二次开发内容)

仅修改 1 个文件:`dist/index.js` 的 `register()` 方法:

- **上游**:`const webhookPath = normalizeWebhookPath(getChannelConfig(api.config).webhookPath ?? DEFAULT_WEBHOOK_PATH);`
- **本仓库**:不再依赖 `openclaw/plugin-sdk` 的 `normalizeWebhookPath` 导出,改为内联实现(仅保证路径以 `/` 开头):

```js
const rawPath = getChannelConfig(api.config).webhookPath ?? DEFAULT_WEBHOOK_PATH;
const webhookPath = rawPath.startsWith("/") ? rawPath : "/" + rawPath;
```

> 原始版本备份见 `docs/index.js.original.bak`。

## 安装(供其他 OpenClaw 实例使用)

```bash
# 方式一:git 安装
npm install git+ssh://git@github.com/MaLeon/wechat-kf.git
# 或
npm install git+https://github.com/MaLeon/wechat-kf.git

# 方式二:本地目录安装
npm install /path/to/wechat-kf-repo
```

在 `openclaw.json` 的 `plugins.entries` 中启用:

```json
{
  "plugins": {
    "entries": {
      "wechat-kf": { "enabled": true }
    }
  }
}
```

> 包名保持 `@pawastation/wechat-kf`,与 OpenClaw 插件解析机制兼容。

## 配置(脱敏模板)

`openclaw.json` → `channels.wechat-kf`:

```json
{
  "enabled": true,
  "corpId": "wwxxxxxxxxxxxxxxxx",
  "appSecret": "<企业微信应用密钥>",
  "token": "<回调 token>",
  "encodingAESKey": "<43 位 AES key>",
  "webhookPath": "/wechat-kf",
  "dmPolicy": "open",
  "allowFrom": ["*"],
  "groupAllowFrom": ["*"]
}
```

回调地址:`https://<你的网关域名>/wechat-kf`

## 文件结构

```
├── dist/                  # 编译产物(含二次开发后的 index.js)
│   └── src/
├── docs/
│   └── index.js.original.bak   # 上游原始 index.js 备份
├── openclaw.plugin.json   # OpenClaw 插件清单
├── package.json           # 包定义(名称保持 @pawastation/wechat-kf)
├── LICENSE                # MIT(上游作者 pawaca)
├── README.md              # 本文件
└── README.zh-CN.md        # 上游中文文档
```

## License

MIT © [pawaca](https://github.com/pawastation/wechat-kf) — 本仓库为 fork 二次开发,保留原 LICENSE。
