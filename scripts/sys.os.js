async () => {

    const {spawn, exec} = (await import('node:child_process'));

    return class OS {
        constructor(logger) {
            this.logger = logger;
            this.proc = null;
        }
        async run(cmd, detached, shell, procCallback, closeCallback) {

            let args = cmd.split(' ');
            let firstArg = args.shift();

            const p = spawn(firstArg, args, {shell, detached});
            this.proc = p;
            if (procCallback) await procCallback(p);

            p.stdout.on('data', data => this.logger.info(data.toString().trim()));
            p.stderr.on('data', data => this.logger.error(data.toString().trim()));
            p.on('error', err => this.logger.error(err.toString()));
            p.on('close', code => {
                this.logger.info({m: 'Process close:', code})
                if (closeCallback) closeCallback(code);
            });
        }

        async ex(cmd) {
            return new Promise((resolve, reject) => {
                exec(cmd, (err, stdout, stderr) => resolve({err, stdout, stderr}));
            });
        }
    }
}