(rq) => {
        const query = {};
        const url = new URL('http://t.c' + rq.url);
        url.searchParams.forEach((v, k) => {
            query[k] = v
        });
        return query;
    }