# 🛡️ LOA Bot Apex

The most stable, luxurious leave‑of‑absence management for Discord.

## ✨ Features
- Submit, approve, deny, cancel, extend LOAs
- Multi‑admin support (any number of roles)
- Whitelist system for submissions
- Cooldown control (check & clear)
- Automatic role assignment on approve, removal on cancel/expire
- Auto‑expire & reminder systems
- Flexible configuration – set roles by **name**, **mention**, or **ID**
- Elegant gold‑themed embeds, pagination, mobile‑friendly

## 🚀 Quick Start
```bash
cp .env.example .env   # edit with your token, client ID, MongoDB URI
npm install
npm run build
npm run deploy
npm start
```

## 📋 Commands
| Command | Description |
|---------|-------------|
| `/setup` | One‑click smart configuration |
| `/loarequest` | Submit a new LOA |
| `/loalist` | View & filter LOAs |
| `/loacd check` | Check cooldown |
| `/loacd clear` | Admin: clear cooldown |
| `/loa approve` | Approve a pending LOA |
| `/loa deny` | Deny with optional reason |
| `/loa cancel` | Cancel an LOA |
| `/loa extend` | Extend an approved LOA |
| `/loa history` | View history & statistics |
| `/loa config` | Modify all settings |
| `/loawl` | Manage whitelist (add/remove/list) |

## 💡 Tips
- The bot requires `Manage Roles` and must be **above** the LOA role.
- Whitelist is empty by default – use `/loawl add` to restrict.
- Use `npm run dev` for development with auto‑reload.

---

Built with precision. Free forever.