import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import Logger from './utils/logger';
dotenv.config();
const logger = new Logger();

const commands = [
  { name: 'setup', description: 'Setup the LOA bot', default_member_permissions: '0' },
  {
    name: 'loarequest', description: 'Submit a new LOA', options: [
      { type: 3, name: 'type', description: 'Type', required: true, autocomplete: true },
      {
        type: 3, name: 'duration', description: 'Duration', required: true, choices: [
          { name: '1 Day', value: '1d' },
          { name: '3 Days', value: '3d' },
          { name: '7 Days', value: '7d' },
          { name: '14 Days', value: '14d' },
          { name: '30 Days', value: '30d' },
          { name: 'Custom', value: 'custom' }
        ]
      },
      { type: 3, name: 'department', description: 'Department', required: false, autocomplete: true }
    ]
  },
  {
    name: 'loalist', description: 'View LOAs', options: [
      { type: 3, name: 'filter', description: 'Filter', choices: [{ name: 'All', value: 'all' }, { name: 'Pending', value: 'pending' }, { name: 'Approved', value: 'approved' }, { name: 'Active', value: 'active' }] },
      { type: 3, name: 'department', description: 'Department', required: false, autocomplete: true },
      { type: 6, name: 'user', description: 'User' }
    ]
  },
  {
    name: 'loacd', description: 'Check or clear cooldown', options: [
      {
        type: 1, name: 'check', description: 'Check cooldown status',
        options: [{ type: 6, name: 'user', description: 'User to check (leave empty for yourself)', required: false }]
      },
      {
        type: 1, name: 'clear', description: 'Clear a user\'s cooldown (Admin only)',
        options: [{ type: 6, name: 'user', description: 'User to clear cooldown for', required: true }]
      }
    ]
  },
  {
    name: 'loa', description: 'LOA management', options: [
      {
        type: 1, name: 'approve', description: 'Approve',
        options: [{ type: 3, name: 'id', description: 'LOA ID', required: true, autocomplete: true }]
      },
      {
        type: 1, name: 'deny', description: 'Deny',
        options: [
          { type: 3, name: 'id', description: 'LOA ID', required: true, autocomplete: true },
          { type: 3, name: 'reason', description: 'Reason' }
        ]
      },
      {
        type: 1, name: 'cancel', description: 'Cancel',
        options: [{ type: 3, name: 'id', description: 'LOA ID', required: true, autocomplete: true }]
      },
      {
        type: 1, name: 'extend', description: 'Extend',
        options: [
          { type: 3, name: 'id', description: 'LOA ID', required: true, autocomplete: true },
          {
            type: 3, name: 'duration', description: 'Extension', required: true, choices: [
              { name: '1 Day', value: '1d' },
              { name: '3 Days', value: '3d' },
              { name: '7 Days', value: '7d' },
              { name: '14 Days', value: '14d' },
              { name: '30 Days', value: '30d' }
            ]
          }
        ]
      },
      {
        type: 1, name: 'history', description: 'History',
        options: [
          { type: 6, name: 'user', description: 'User' },
          { type: 3, name: 'filter', description: 'Filter', choices: [{ name: 'All', value: 'all' }, { name: 'Approved', value: 'approved' }, { name: 'Denied', value: 'denied' }] }
        ]
      },
      {
        type: 1, name: 'config', description: 'Config',
        options: [
          {
            type: 3, name: 'setting', description: 'Setting', choices: [
              { name: 'Log Channel', value: 'logChannel' },
              { name: 'Staff Role', value: 'staffRole' },
              { name: 'Admin Roles', value: 'adminRoles' },
              { name: 'LOA Role', value: 'loaRole' },
              { name: 'Max Duration', value: 'maxLoaDuration' },
              { name: 'Cooldown', value: 'cooldownHours' }
            ]
          },
          { type: 3, name: 'value', description: 'Value' }
        ]
      }
    ]
  },
  {
    name: 'loawl', description: 'Manage whitelist', options: [
      {
        type: 1, name: 'add', description: 'Add role to whitelist',
        options: [{ type: 8, name: 'role', description: 'Role to add', required: true }]
      },
      {
        type: 1, name: 'remove', description: 'Remove role from whitelist',
        options: [{ type: 8, name: 'role', description: 'Role to remove', required: true }]
      },
      { type: 1, name: 'list', description: 'List whitelisted roles' }
    ], default_member_permissions: '0'
  }
];

(async () => {
  try {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);
    if (process.env.DISCORD_GUILD_ID) {
      await rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID!, process.env.DISCORD_GUILD_ID), { body: commands });
    } else {
      await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!), { body: commands });
    }
    logger.success('Commands deployed');
  } catch (e) { logger.error('Deploy failed:', e); }
})();