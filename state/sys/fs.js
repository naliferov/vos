async () => {
    const promise = (await import("node:fs")).promises;
    const {createReadStream, createWriteStream} = (await import("node:fs"));

    return class FS {
    
        //readFileNative = util.promisify(fs.readFile);
        //writeFileNative = util.promisify(fs.writeFile);
        // renameNative = util.promisify(fs.rename);
        // mkdir = util.promisify(fs.mkdir);
        // open = util.promisify(fs.open);
        // close = util.promisify(fs.close);
        constructor(logger) { this.logger = logger; }

        async openFile(path, flags) { return await promise.open(path, flags); }
        async closeFile(fd) { return await promise.close(fd); }
        async readFile(path, encoding) { return await promise.readFile(path, encoding === undefined ? 'utf8' : encoding) }
        async writeFile(path, data) { return await promise.writeFile(path, data) }
        async rm(path) { return await promise.rm(path) }
        async stat(path) { return await promise.stat(path) }

        async watch(path) {
            const p = (await import("node:fs")).promises;
            return p.watch(path);
        }
        async createReadStream(path, options) { return createReadStream(path, options); } //using old api because promise.createReadStream cause warnings
        async createWriteStream(path, options) { return createWriteStream(path, options); }

        async writeFileIfNotExistsCreate(path, data) {}
        async readFileIfNotExistsCreate(path, defaultValue = '') {
            if (!await this.exists(path)) {
                await this.writeFile(path, defaultValue);
                return defaultValue;
            }
            return await this.readFile(path);
        }
        async mv(oldPath, newPath) { return await this.renameNative(oldPath, newPath); }
    
        async readJSONIfNotExistsCreate(path) {
            if (!this.exists(path)) {
                await this.writeFile(path, '{}');
                return {};
            }
            return JSON.parse(await this.readFile(path, 'utf8'));
        }
    
        async exists(path) {
            try {
                await promise.access(path);
                return true;
            } catch (e) {
                return false;
            }
        }

        async mkDirIfNotExists(path) {
            if (!await this.exists(path)) await promise.mkdir(path, {recursive: true});
        }
        async mkDir(path) { return await this.mkdir(path); }
        async readDir(path) {
            return new Promise((resolve) => {
                fs.readdir(path, (err, files) => resolve(files));
            });
        }
        rmSync(path) { fs.rmSync(path); }

        extract() {
            console.log(s.decompress);
        }
    }
}