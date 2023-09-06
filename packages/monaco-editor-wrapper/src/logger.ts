export type LoggerConfig = {
    enabled: boolean,
    debugEnabled?: boolean
};

export class Logger {

    private enabled: boolean;
    private debugEnabled: boolean;

    constructor(config?: LoggerConfig) {
        this.enabled = !config ? true : config!.enabled === true;
        this.debugEnabled = this.enabled && config?.debugEnabled === true;
    }

    isEnabled() {
        return this.enabled;
    }

    isDebugEnabled() {
        return this.debugEnabled;
    }

    info(message: string) {
        if (this.enabled) {
            console.log(message);
        }
    }

    debug(message: string, force?: boolean) {
        if (this.enabled && (this.debugEnabled || force === true)) {
            console.debug(message);
        }
    }
}
