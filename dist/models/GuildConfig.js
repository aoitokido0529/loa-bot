"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuildConfig = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const GuildConfigSchema = new mongoose_1.Schema({
    guildId: { type: String, required: true, unique: true },
    logChannel: String,
    staffRole: String,
    adminRoles: { type: [String], default: [] },
    loaRole: String,
    departments: { type: [String], default: ['General', 'Medical', 'Personal', 'Training', 'Other'] },
    loaTypes: { type: [String], default: ['Full LOA', 'Partial LOA', 'Semi LOA', 'Extended Break'] },
    maxLoaDuration: { type: Number, default: 30, min: 1, max: 365 },
    cooldownHours: { type: Number, default: 24, min: 0, max: 720 },
    allowStaffOverride: { type: Boolean, default: true },
    notifications: { type: Boolean, default: true },
    autoExpire: { type: Boolean, default: true },
    whitelistRoles: { type: [String], default: [] }
}, { timestamps: true });
exports.GuildConfig = mongoose_1.default.model('GuildConfig', GuildConfigSchema);
exports.default = exports.GuildConfig;
//# sourceMappingURL=GuildConfig.js.map