export declare class Logger {
    private ts;
    info(msg: string, ...args: any[]): void;
    success(msg: string, ...args: any[]): void;
    warn(msg: string, ...args: any[]): void;
    error(msg: string, ...args: any[]): void;
    debug(msg: string, ...args: any[]): void;
}
export default Logger;
