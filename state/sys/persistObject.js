async () => {

    const fs = new ( await (x('9f0e6908-4f44-49d1-8c8e-10e1b0128858')) );
    
    return class PersistObject {

        constructor(path) {
            this.path = path;
            this.obj = {};
        }
        async init() {
            if (this.initiated) return;
            if (await fs.exists(this.path)) {
                this.obj = JSON.parse(await fs.readFile(this.path));
            } else {
                await fs.writeFile(this.path, '{}');
            }
            this.initiated = 1;
        }
        async s(k, v) {
            if (!this.initiated) await this.init();
            this.obj[k] = v;
            await fs.writeFile(this.path, JSON.stringify(this.obj));
        }
        async g(k) {
            if (!this.initiated) await this.init();
            return this.obj[k];
        }
        async d(k) {
            if (!this.initiated) await this.init();
            delete this.obj[k];
            await fs.writeFile(this.path, JSON.stringify(this.obj));
        }
    }
}





