rq => {

        const header = rq.headers.cookie;
        if (!header || header.length < 1) {
            return {};
        }

        const cookies = header.split('; ');
        const result = {};
        for (let i in cookies) {

            const cookie = cookies[i].trim();
            const index = cookie.indexOf('=');
            if (index === -1) continue;

            const k = cookie.slice(0, index);
            const v = cookie.slice(index + 1);

            if (!k || !v) continue;

            result[k.trim()] = v.trim();
        }
        return result;
    }