(rq, tokenName) => {
        if (!rq.headers.cookie || rq.headers.cookie.length < 1) return;

        const cookies = rq.headers.cookie.split(';');
        for (let i in cookies) {
            const cookieKV = cookies[i].trim().split('=');
            if (cookieKV[0] === tokenName && cookieKV[1]) {
                return cookieKV[1].trim();
            }
        }
    }