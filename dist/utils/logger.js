"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    getTimestamp() {
        return new Date().toISOString();
    }
    info(message, ...args) {
        console.log(`[${this.getTimestamp()}] [INFO] ${message}`, ...args);
    }
    success(message, ...args) {
        console.log('\x1b[32m%s\x1b[0m', `[${this.getTimestamp()}] [SUCCESS] ${message}`, ...args);
    }
    warn(message, ...args) {
        console.warn('\x1b[33m%s\x1b[0m', `[${this.getTimestamp()}] [WARN] ${message}`, ...args);
    }
    error(message, ...args) {
        console.error('\x1b[31m%s\x1b[0m', `[${this.getTimestamp()}] [ERROR] ${message}`, ...args);
    }
    debug(message, ...args) {
        if (process.env.NODE_ENV === 'development') {
            console.debug(`[${this.getTimestamp()}] [DEBUG] ${message}`, ...args);
        }
    }
}
exports.Logger = Logger;
exports.default = Logger;
//# sourceMappingURL=logger.js.map