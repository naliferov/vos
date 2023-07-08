() => {
    return class Logger {
        constructor(prefix = '') {
            this.prefix = prefix;
            this.isMuted = 0;
        }
        mute() { this.isMuted = 1 } unmute() { this.isMuted = 0 }
        onMessage(handler) { this.handler = handler; return this; }

        async log() {
            let s = this.prefix + '';
            
            for (let i = 0; i < arguments.length; i++) {
                const m = arguments[i];
                const isObjOrArray = typeof m === 'object' && m !== null;

                if (m instanceof Error) {
                    s += m.stack ?? m.toString();
                } else {
                    s += isObjOrArray ? ' ' + JSON.stringify(m) : m;
                }
            }
            if (!this.isMuted) console.log(s);
            if (this.handler) this.handler(s);
        }
        async info() { await this.log(...arguments); }
        async error() { await this.log(...arguments); }
    }
}