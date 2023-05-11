(rq) => {
        let { token } = s.sys.rqGetCookies(rq);
        return token && s.sys.token && token === s.sys.token;
    }