**English** | [中文](./README.zh-CN.md)

# WeChat KF for OpenClaw

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![OpenClaw](https://img.shields.io/badge/OpenClaw-channel%20plugin-blue.svg)](https://openclaw.dev)

Let WeChat users chat with your OpenClaw AI agent via **WeChat Customer Service**.

---

## Features

- **No follow required** — users tap a link to start chatting, no need to follow any account first
- **Rich message types** — send and receive text, images, voice, video, files, link cards, mini-program cards, menus, and more
- **Markdown styling** — bold, lists, and headings render as Unicode-styled text in WeChat
- **Free to use** — the WeChat KF API itself is free; no enterprise verification required
- **Easy setup** — no domain verification, no IP whitelist; a free Cloudflare Tunnel is enough

### Inbound message types

| Type                    | Notes                                                                                     |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| Text                    | Plain text, including menu callbacks                                                      |
| Image                   | Image attachments                                                                         |
| Voice                   | AMR-format voice messages                                                                 |
| Video                   | Video attachments                                                                         |
| File                    | Any file attachment                                                                       |
| Link                    | Shared link cards                                                                         |
| Mini-program            | Mini-program cards                                                                        |
| Location                | Geographic location with coordinates                                                      |
| Merged messages         | Forwarded message bundles — rich text extraction (link, location, mini-program, channels) and media download |
| Channels shop product   | Video Channel product cards                                                               |
| Channels shop order     | Video Channel order messages                                                              |
| Channels post/live/card | Video Channel post, live, or profile card; only partial fields returned (nickname, title) |
| User notes              | Type detected only; API does not expose note content                                      |

### Outbound message types

| Type              | Notes                          |
| ----------------- | ------------------------------ |
| Text              | Plain text                     |
| Image             | Image attachments              |
| Voice             | AMR voice                      |
| Video             | Video attachments              |
| File              | Any file                       |
| Link card         | Rich link with thumbnail       |
| Mini-program card | Mini-program jump card         |
| Menu              | Quick-reply menu buttons       |
| Business card     | Employee contact card          |
| Location          | Geographic location            |
| Acquisition link  | Customer acquisition link card |

### WeChat-specific features

- **Markdown → Unicode styling** — bold, lists, and headings in agent replies are converted to Unicode-styled characters that render visually in WeChat (e.g., 𝗯𝗼𝗹𝗱 text, bullet symbols)
- **Message debounce** (`debounceMs`) — when a user sends multiple messages in rapid succession, the plugin waits until no new message arrives within the window, then delivers them all together to the agent as a single turn

---

## Prerequisites

1. A **WeCom account** (企业微信) — register with the WeCom app (personal accounts work; no real company required)
2. **OpenClaw 2026.7.1-2** and Node.js 22.22.3+, 24.15.0+, or 25.9.0+ — see [OpenClaw docs](https://docs.openclaw.ai/)

---

## Installation

`0.4.1` fixes legacy configuration validation, the startup ESM race, and missing runtime files in Git installs. Existing `channels.wechat-kf.allowedKfIds` and `channels.wechat-kf.groupAllowFrom` arrays can remain in your configuration. `allowedKfIds` restricts the customer-service accounts used by the plugin; omitted or empty allows all discovered accounts. `groupAllowFrom` is retained for compatibility only: this channel supports direct messages, and DM sender restrictions use `dmPolicy` with `allowFrom`. If a repair tool removed these fields, restore the intended values from your configuration backup.

If `0.4.0-maleon.1` reports `ERR_REQUIRE_ESM_RACE_CONDITION` for `openclaw/plugin-sdk/channel-plugin-common`, upgrade to the fixed package. Bootstrap now uses local schema and pairing helpers with SDK compatibility tests, avoiding runtime SDK imports while preserving synchronous registration. OpenClaw `2026.7.1-2` requires `register()` to be synchronous; changing it to `async` is not a valid fix.

The fixed package also includes `dist/src/message-ledger.js` (missing files caused a separate `ERR_MODULE_NOT_FOUND`) and package export fallbacks for CommonJS loaders. Extracted-package loading, registration, and concurrent SDK loading were verified locally with OpenClaw `2026.7.1-2` on Node `24.19.0` and `26.7.0` (macOS ARM64). The production Linux gateway and live WeCom message flow still require deployment verification.

```bash
# Install this maintained repository
openclaw plugins install git+https://github.com/MaLeon/wechat-kf.git#main
```

---

## Setup guide

> The WeCom and WeChat KF admin consoles are in Chinese. For detailed step-by-step screenshots, see the [Chinese setup guide](./README.zh-CN.md#快速开始).

**Step 1 — Install a tunnel**

WeChat KF requires a public callback URL. Start a Cloudflare Tunnel:

```bash
cloudflared tunnel --url http://localhost:7860  # replace with your gateway port
```

Note the `https://xxxx.trycloudflare.com` URL it prints.

**Step 2 — Get your Corp ID**

In the [WeCom Admin console](https://work.weixin.qq.com/wework_admin/frame), go to **My Enterprise** and copy the **Enterprise ID** (format: `wwXXXXXXXXXXXXXXXX`).

**Step 3 — Create a self-built WeCom app**

In the [WeCom Admin console](https://work.weixin.qq.com/wework_admin/frame), create a **self-built app** and copy its Secret. This is the Secret used for `appSecret`; the callback page does not issue an API Secret.

**Step 4 — Create a KF account**

Open [kf.weixin.qq.com](https://kf.weixin.qq.com/) (scan QR with WeCom app), create a customer service account.

**Step 5 — Authorize the self-built app in WeChat KF**

In WeChat KF Admin → **API-capable apps**, authorize the app from step 3. Then enable **Manage WeChat Customer Service accounts via API** for the customer-service account from step 4. Without both permissions, `sync_msg` and reply calls will fail.

**Step 6 — Configure callback in WeChat KF admin**

In [kf.weixin.qq.com](https://kf.weixin.qq.com/) → **Dev Config** → **Get Started**:

1. Set callback URL to `https://xxxx.trycloudflare.com/wechat-kf`
2. Click **Random** to generate Token and EncodingAESKey

**Copy the Token and EncodingAESKey — do not click Save yet.** Configure OpenClaw first (next step), then come back to save.

**Step 7 — Configure OpenClaw**

Add the channel to OpenClaw config and enable it. Fill in the Token and EncodingAESKey from step 6 and the self-built app Secret from step 3. **Save the config.**

```yaml
channels:
  wechat-kf:
    enabled: true
    corpId: "wwXXXXXXXXXXXXXXXX"
    appSecret: "" # Secret of the authorized self-built app
    token: "" # from step 6
    encodingAESKey: "" # from step 6
```

Once saved, OpenClaw starts listening on the callback URL, so WeChat's verification request in the next step can succeed.

**Step 8 — Back to WeChat KF admin: verify the callback**

Back in [kf.weixin.qq.com](https://kf.weixin.qq.com/) → **Dev Config**, click **Save** — WeChat sends a verification request; OpenClaw responds automatically and the config takes effect.

**Step 9 — Get the contact link and test**

In the WeChat KF admin, copy the **contact link** for your KF account and open it in WeChat to start chatting with your agent.

**Step 10 — (Recommended) Enable pairing mode**

To restrict access, set `dmPolicy: "pairing"`. New users receive a pairing code; approve with:

```bash
openclaw pairing approve wechat-kf <code>
```

---

## Configuration reference

| Field            | Type     | Required | Default      | Description                                                                                                                |
| ---------------- | -------- | -------- | ------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `enabled`        | boolean  | No       | `false`      | Enable the channel                                                                                                         |
| `corpId`         | string   | **Yes**  | —            | WeCom Corp ID                                                                                                              |
| `appSecret`      | string   | **Yes**  | —            | Secret of the self-built app authorized in WeChat KF Admin                                                                    |
| `token`          | string   | **Yes**  | —            | Webhook callback token                                                                                                     |
| `encodingAESKey` | string   | **Yes**  | —            | 43-char AES key for message encryption                                                                                     |
| `webhookPath`    | string   | No       | `/wechat-kf` | URL path for webhook callbacks                                                                                             |
| `dmPolicy`       | string   | No       | `"open"`     | `open` / `allowlist` / `pairing` / `disabled`                                                                              |
| `allowFrom`      | string[] | No       | `[]`         | Allowed external_userids (when `dmPolicy` is `allowlist`)                                                                  |
| `allowedKfIds`   | string[] | No       | `[]`         | Allowed original `open_kfid` values; omitted or empty allows all discovered accounts; applies to callbacks, polling, and sends |
| `groupAllowFrom` | string[] | No       | —            | Legacy compatibility field; unused because this channel has no group chats                                                   |
| `debounceMs`     | number   | No       | `2000`       | Debounce window in ms (0–10000): waits until no new message in window, then dispatches all to agent; set to `0` to disable |

---

## Limitations

- **Public by design** — anyone with the contact link can send messages; this cannot be prevented at the platform level. Use `dmPolicy: "pairing"` or `"allowlist"` to control who the agent responds to.
- **48-hour reply window** — WeChat only allows replies within 48 hours of the user's last message.
- **5 messages per window** — at most 5 replies before the user sends another message.
- **Voice format** — inbound voice is AMR; transcription depends on your agent's media capabilities.
- **Tunnel URL changes** — free Cloudflare Tunnel URLs change on restart. Use a custom domain pointed to your server, a paid tunnel (e.g. Cloudflare Zero Trust), or a static IP for production.

---

## Developer docs

For architecture, module descriptions, development commands, and contributing workflow, see [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## License

MIT
