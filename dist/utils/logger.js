"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    ts() { return new Date().toISOString(); }
    info(msg, ...args) { console.log(`[${this.ts()}] [INFO] ${msg}`, ...args); }
    success(msg, ...args) { console.log('\x1b[32m%s\x1b[0m', `[${this.ts()}] [SUCCESS] ${msg}`, ...args); }
    warn(msg, ...args) { console.warn('\x1b[33m%s\x1b[0m', `[${this.ts()}] [WARN] ${msg}`, ...args); }
    error(msg, ...args) { console.error('\x1b[31m%s\x1b[0m', `[${this.ts()}] [ERROR] ${msg}`, ...args); }
    debug(msg, ...args) { if (process.env.NODE_ENV === 'development')
        console.debug(`[${this.ts()}] [DEBUG] ${msg}`, ...args); }
}
exports.Logger = Logger;
exports.default = Logger;
//# sourceMappingURL=logger.js.map