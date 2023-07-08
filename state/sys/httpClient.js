() => {
    return class HttpClient {

        constructor(baseURL = '', headers = {}, options = {}) {

            this.headers = headers;
            if (!this.headers['Content-Type']) {
                this.headers['Content-Type'] = 'application/json';
            }
            if (baseURL) this.baseURL = baseURL;
        }

        async rq(method, url, params, headers, options = {}) {
            let timeoutId;
            const controller = new AbortController(); if (options.timeout) timeoutId = setTimeout(() => controller.abort(), options.timeout);
            if (!headers['Content-Type']) headers['Content-Type'] = 'application/json';

            const fetchParams = {method, headers, signal: controller.signal};

            if (method === 'POST') {
                if (params instanceof ArrayBuffer) {
                    fetchParams.body = params;
                } else {
                    fetchParams.body = headers['Content-Type'] === 'application/json' ? JSON.stringify(params) : this.strParams(params);
                }
            } else {
                if (Object.keys(params).length) url += '?' + new URLSearchParams(params);
            }

            const response = await fetch(this.baseURL ? this.baseURL + url : url, fetchParams);
            if (timeoutId) { clearTimeout(timeoutId); timeoutId = null; }

            let res = { statusCode: response.status, headers: response.headers };
            if (options.blob) res.data = await response.blob();
            else {
                const contentType = response.headers.get('content-type') ?? '';
                res.data = contentType.startsWith('application/json') ? await response.json() : await response.text();
            }
            return res;
        }

        async get(url, params = {}, headers = {}, options = {}) { return await this.rq('GET', url, params, headers, options); }
        async post(url, params = {}, headers = {}, options = {}) { return await this.rq('POST', url, params, headers, options); }
        async postBuf(url, buffer, query, headers = {}) {
            if (query) url += '?' + new URLSearchParams(query);
            headers['Content-Type'] = 'application/octet-stream';

            return await this.rq('POST', url, buffer, headers);
        }
        async delete(url, params = {}, headers = {}, options = {}) { return await this.rq('DELETE', url, params, headers, options); }
        strParams(params) {
            let str = '';
            for (let k in params) str = str + k + '=' + params[k] + '&';
            return str.length ? str.slice(0, -1) : '';
        }
        async getFile(url, fName) {
            const fs = new (await s.f('9f0e6908-4f44-49d1-8c8e-10e1b0128858'));
            const r = await fetch(url);
            await fs.writeFile(fName, Buffer.from(await r.arrayBuffer()));
        }
    }

}