"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("./utils/logger"));
dotenv_1.default.config();
const log = new logger_1.default();
const cmds = [
    { name: 'setup', description: '✨ Setup the LOA bot', default_member_permissions: '0' },
    { name: 'loarequest', description: '📝 Submit a new LOA', options: [
            { type: 3, name: 'type', description: 'Type', required: true, autocomplete: true },
            { type: 3, name: 'duration', description: 'Duration', required: true, choices: [{ name: '1 Day', value: '1d' }, { name: '3 Days', value: '3d' }, { name: '7 Days', value: '7d' }, { name: '14 Days', value: '14d' }, { name: '30 Days', value: '30d' }, { name: 'Custom', value: 'custom' }] },
            { type: 3, name: 'department', description: 'Department', required: false, autocomplete: true }
        ] },
    { name: 'loalist', description: '📋 View LOAs', options: [
            { type: 3, name: 'filter', description: 'Filter', choices: [{ name: 'All', value: 'all' }, { name: 'Pending', value: 'pending' }, { name: 'Approved', value: 'approved' }, { name: 'Active', value: 'active' }] },
            { type: 3, name: 'department', description: 'Department', required: false, autocomplete: true },
            { type: 6, name: 'user', description: 'User' }
        ] },
    { name: 'loacd', description: '⏰ Cooldown management', options: [
            { type: 1, name: 'check', description: 'Check cooldown', options: [{ type: 6, name: 'user', description: 'User' }] },
            { type: 1, name: 'clear', description: 'Clear cooldown (Admin)', options: [{ type: 6, name: 'user', description: 'User', required: true }] }
        ] },
    { name: 'loa', description: '🛠️ LOA management', options: [
            { type: 1, name: 'approve', description: 'Approve', options: [{ type: 3, name: 'id', description: 'LOA ID', required: true, autocomplete: true }] },
            { type: 1, name: 'deny', description: 'Deny', options: [{ type: 3, name: 'id', description: 'LOA ID', required: true, autocomplete: true }, { type: 3, name: 'reason', description: 'Reason' }] },
            { type: 1, name: 'cancel', description: 'Cancel', options: [{ type: 3, name: 'id', description: 'LOA ID', required: true, autocomplete: true }] },
            { type: 1, name: 'extend', description: 'Extend', options: [{ type: 3, name: 'id', description: 'LOA ID', required: true, autocomplete: true }, { type: 3, name: 'duration', description: 'Extension', required: true, choices: [{ name: '1 Day', value: '1d' }, { name: '3 Days', value: '3d' }, { name: '7 Days', value: '7d' }] }] },
            { type: 1, name: 'history', description: 'History', options: [{ type: 6, name: 'user', description: 'User' }, { type: 3, name: 'filter', description: 'Filter', choices: [{ name: 'All', value: 'all' }, { name: 'Approved', value: 'approved' }, { name: 'Denied', value: 'denied' }] }] },
            { type: 1, name: 'config', description: 'Config', options: [{ type: 3, name: 'setting', description: 'Setting', choices: [{ name: 'Log Channel', value: 'logChannel' }, { name: 'Staff Role', value: 'staffRole' }, { name: 'Admin Roles', value: 'adminRoles' }, { name: 'LOA Role', value: 'loaRole' }, { name: 'Max Duration', value: 'maxLoaDuration' }, { name: 'Cooldown', value: 'cooldownHours' }] }, { type: 3, name: 'value', description: 'Value' }] }
        ] },
    { name: 'loawl', description: '🛡️ Whitelist management', options: [
            { type: 1, name: 'add', description: 'Add role', options: [{ type: 8, name: 'role', description: 'Role', required: true }] },
            { type: 1, name: 'remove', description: 'Remove role', options: [{ type: 8, name: 'role', description: 'Role', required: true }] },
            { type: 1, name: 'list', description: 'List whitelist' }
        ], default_member_permissions: '0' }
];
(async () => {
    try {
        const rest = new discord_js_1.REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        if (process.env.DISCORD_GUILD_ID) {
            await rest.put(discord_js_1.Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID), { body: cmds });
        }
        else {
            await rest.put(discord_js_1.Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), { body: cmds });
        }
        log.success('Commands deployed');
    }
    catch (e) {
        log.error('Deploy failed', e);
    }
})();
//# sourceMappingURL=deploy-commands.js.map