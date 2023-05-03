async path => {
    return {
        isStarted: false,
        ac: new AbortController,
        start: async function () {
            if (this.isStarted) return;
            this.generator = await s.nodeFS.watch(path, {signal: this.ac.signal});
            for await (const e of this.generator) if (this.slicer) await this.slicer(e);
            s.l('s.fsChangesSlicer STARTED');
            this.isStarted = true;
        },
        stop: function () { this.ac.abort(); }
    }
}