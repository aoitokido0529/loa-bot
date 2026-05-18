export class Logger {
    private getTimestamp(): string {
        return new Date().toISOString();
    }

    info(message: string, ...args: any[]): void {
        console.log(`[${this.getTimestamp()}] [INFO] ${message}`, ...args);
    }

    success(message: string, ...args: any[]): void {
        console.log('\x1b[32m%s\x1b[0m', `[${this.getTimestamp()}] [SUCCESS] ${message}`, ...args);
    }

    warn(message: string, ...args: any[]): void {
        console.warn('\x1b[33m%s\x1b[0m', `[${this.getTimestamp()}] [WARN] ${message}`, ...args);
    }

    error(message: string, ...args: any[]): void {
        console.error('\x1b[31m%s\x1b[0m', `[${this.getTimestamp()}] [ERROR] ${message}`, ...args);
    }

    debug(message: string, ...args: any[]): void {
        if (process.env.NODE_ENV === 'development') {
            console.debug(`[${this.getTimestamp()}] [DEBUG] ${message}`, ...args);
        }
    }
}

export default Logger;