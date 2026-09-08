# CrowdChat 💬

CrowdChat is a real-time web chat platform built for one large, active, and social public online community.

---

## 🌟 Key Features

1. **Main Community Public Chat (`#main`)**
   - Instant real-time messaging using WebSockets (`Socket.io`).
   - Message replies, inline editing, message deletion, and Unicode reactions.
   - Interactive YouTube player embeds and OpenGraph rich URL previews.
   - Built-in GIF search catalog and custom sticker library.
   - Image uploads (drag-and-drop & paste directly from clipboard).

2. **Private Direct Messages (1-to-1 DMs)**
   - Instant messaging with read indicators, real-time typing status, and live presence.
   - Block and reporting controls.

3. **Private Groups (Up to 10 Members)**
   - Custom group names, icons, member invitation, owner controls, and group media sharing.

4. **Profiles & Presence**
   - Custom avatar generator/uploads, bios, custom status messages, and customizable accent colors.
   - Real-time online, idle, do-not-disturb, and offline presence tracking.

5. **Safety, Moderation & Admin Tools**
   - User report queue with one-click resolution.
   - Timed mute and permanent ban tools with audit logging.
   - Token-bucket message rate limiting preventing spam/floods.
   - Sensitive personal information and regex safety filters.

---

## 🚀 Quick Start Guide

### 1. Install Dependencies & Seed Database
```bash
npm run setup

(This installs root, backend, and frontend packages, runs SQLite migrations, and
creates the #main channel along with seed demo accounts).

2. Start Backend & Frontend Concurrently

npm run dev

3. Access CrowdChat in your Browser

  - Frontend App: http://localhost:5173
  - Backend API: http://localhost:5000

👥 Demo Testing Accounts

You can log in instantly using the Quick Demo Accounts buttons on the login
screen or manually:

| Username    | Role          | Password       | Description                                            |
| ----------- | ------------- | -------------- | ------------------------------------------------------ |
| `admin`     | **Admin**     | `Password123!` | Full administrator with access to the Moderation Suite |
| `pixel_sam` | **Moderator** | `Password123!` | Community moderator & pixel artist                     |
| `elena_dev` | **User**      | `Password123!` | Active member                                          |
| `kai_beats` | **User**      | `Password123!` | Active member                                          |


---

### Verification and Operational Highlights

1. **Multiplayer Test**: Open two different browser tabs (one regular, one incognito). Log into `admin` in tab 1 and `pixel_sam` in tab 2. Send a message in `#main` or open a DM between them: messages, typing indicators, reactions, and online presence sync without page reloads.
2. **Media Previews**: Paste a YouTube link (e.g. `https://www.youtube.com/watch?v=dQw4w9WgXcQ`) or any website URL to see automatic rich card and responsive embed generation.
3. **Spam Protection**: Rapidly send more than 5 messages in 4 seconds to trigger the token-bucket rate limiter.
4. **Moderation Queue**: Click "Report" on any message. Log into the `admin` account, open the **Moderation & Admin** panel from the sidebar, view the report in the queue, and issue mutes/bans or resolve the report.
