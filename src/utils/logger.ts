export class Logger {
    private ts() { return new Date().toISOString(); }
    info(msg: string, ...args: any[]) { console.log(`[${this.ts()}] [INFO] ${msg}`, ...args); }
    success(msg: string, ...args: any[]) { console.log('\x1b[32m%s\x1b[0m', `[${this.ts()}] [SUCCESS] ${msg}`, ...args); }
    warn(msg: string, ...args: any[]) { console.warn('\x1b[33m%s\x1b[0m', `[${this.ts()}] [WARN] ${msg}`, ...args); }
    error(msg: string, ...args: any[]) { console.error('\x1b[31m%s\x1b[0m', `[${this.ts()}] [ERROR] ${msg}`, ...args); }
    debug(msg: string, ...args: any[]) { if (process.env.NODE_ENV === 'development') console.debug(`[${this.ts()}] [DEBUG] ${msg}`, ...args); }
}
export default Logger;