obj => {
        const size = Buffer.byteLength(obj);
        return {b: size, kb: size / 1024, mb: size / 1024 / 1024};
    }