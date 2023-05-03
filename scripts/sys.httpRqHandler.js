async (rq, rs) => {
        const ip = rq.socket.remoteAddress;
        const isLocal = ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1';
        rq.isLocal = isLocal;

        const url = new URL('http://t.c' + rq.url);
        rq.pathname = url.pathname;
        rq.mp = `${rq.method}:${url.pathname}`;
        s.l(ip, rq.mp);

        if (rq.pathname.includes('..')) {
            rs.writeHead(403).end('Path include ".." denied.'); return;
        }
        if (rq.url.toLowerCase().includes('secrets.json')) {
            rs.writeHead(403).end('denied secrets.json'); return;
        }
        rs.s = (v, contentType) => {
            const s = (value, type) => rs.writeHead(200, {'Content-Type': type}).end(value);

            if (!v) s('empty val', 'text/plain; charset=utf-8');
            else if (v instanceof Buffer) s(v, '');
            else if (typeof v === 'object') s(JSON.stringify(v), 'application/json');
            else if (typeof v === 'string' || typeof v === 'number') s(v, contentType ?? 'text/plain; charset=utf-8');
            else s('', 'text/plain');
        }

        const m = {
            'POST:/cmd': async () => {
                if (!isLocal || !s.sys.rqAuthenticate(rq)) {
                    rs.writeHead(403).end('denied');
                    return;
                }
                const {cmd} = await s.sys.rqParseBody(rq);
                if (cmd) {
                    try { eval(cmd); }
                    catch (e) { console.log(e); }
                }
            },
            'GET:/trigger': async () => {
                if (!isLocal) return;
                if (s.trigger) s.trigger();
            },
            'GET:/': async () => rs.s(await s.f('sys.apps.GUI.html'), 'text/html'),
            'GET:/stream': async () => {
                const rqId = await s.f('sys.uuid');

                s.log.info('SSE connected');
                s.connectedSSERequests.set(rqId, rs);
                rs.writeHead(200, {'Content-Type': 'text/event-stream', 'Connection': 'keep-alive', 'Cache-Control': 'no-cache'});

                rq.on('close', () => {
                    s.connectedSSERequests.delete(rqId);
                    s.log.info('SSE closed');
                });
                rq.isLongRequest = true;
            },
            'GET:/module.js': async () => {
                const {id} = sys.rqParseQuery(rq);
                if (!id) {
                    rs.writeHead(400).end('id is invalid.'); return;
                }
                const obj = s.find(id);
                if (obj && obj.js) {
                    rs.setHeader('Content-Type', 'text/javascript');
                    rs.end('export default ' + obj.js);
                }
            },
            'POST:/state': async () => {
                const {path} = await s.sys.rqParseBody(rq);
                if (!Array.isArray(path)) {
                    rs.writeHead(403).end('Path is invalid.'); return;
                }
                if (path[0] === 'sys') {
                    if (path[1] === 'secrets' || path[1] === 'token') {
                        rs.writeHead(403).end('Access denied.'); return;
                    }
                }

                let node = s.find(path);
                const pathStr = 'state/' + path.join('/');

                //todo get path info will be better
                if (typeof node === 'object' && !Array.isArray(node) && Object.keys(node).length < 1) {

                    if (await s.fsAccess(pathStr)) {
                        const list = await s.nodeFS.readdir(pathStr);
                        for (let i = 0; i < list.length; i++) {
                            const item = list[i];
                            if (!item.endsWith('.json')) continue;
                            const id = item.slice(0, -5);
                            if (!node[id]) node[id] = {};
                        }

                    } else if (await s.fsAccess(pathStr + '.json')) {
                        const {parent, k} = s.findParentAndK(path);
                        node = JSON.parse(await s.nodeFS.readFile(pathStr + '.json', 'utf8'));
                        if (parent && k) parent[k] = node;
                    }
                }
                //todo level of depth of object or array
                rs.s(node);
            },
            'POST:/stateUpdate': async () => {
                if (!s.sys.rqStateUpdate) {
                    rs.s('Server state is not ready.'); return;
                }
                await s.f('sys.rqStateUpdate', rq, rs);
            },
            'POST:/sysUpdate': async () => {
                if (!s.sys.rqAuthenticate(rq)) {
                    rs.writeHead(403).end('denied');
                    return;
                }
                const {sys} = await s.sys.rqParseBody(rq);
                s.merge(s.sys, sys);
                rs.s('ok');
            },
            'POST:/sign/in': async () => {
                //todo add rate limit
                const {token} = await s.sys.rqParseBody(rq);
                if (!token || typeof token !== 'string') {
                    rs.writeHead(400).end('Token is invalid.');
                    return;
                }
                const {users} = await s.sys.getSecrets();
                if (!users[token]) {
                    rs.writeHead(404).end('User not found.');
                    return;
                }
                rs.writeHead(200, {
                    'Set-Cookie': `token=${token}; Path=/; Max-Age=2580000; SameSite=Strict; Secure; HttpOnly`,
                    'Content-Type': 'text/plain'
                }).end('ok');
            },
            'POST:/sign/out': async () => {
                rs.writeHead(200, {
                    'Set-Cookie': `token=str; Path=/; Max-Age=-1; SameSite=Strict; Secure; HttpOnly`,
                    'Content-Type': 'text/plain'
                }).end('ok');
            },
            // 'GET:/authorizedUser': async () => {
            //     const cookies = s.sys.rqGetCookies(rq);
            //     if (!cookies.token) {
            //         rs.s({userName: null});
            //         return;
            //     }
            //     const users = (await s.sys.getSecrets()).users;
            //     let userName = users[cookies.token];
            //     rs.s({userName});
            // },
            'POST:/uploadFile': async () => {
                if (!rq.isLocal) { rs.writeHead(403).end('denied'); return; }

                const b = await s.sys.rqParseBody(rq);
                if (b.err) return;
                if (b) await s.nodeFS.writeFile('testFIL', b);
                rs.s('ok');
            },
        }

        if (!rq.mp.startsWith('GET:/module.js')) {
            if (s.sys.rqResolveStatic && await s.sys.rqResolveStatic(rq, rs)) return;
        }
        if (m[rq.mp]) {
            try { await m[rq.mp](); }
            catch (e) {
                s.log ? s.log.error(e) : console.log(e);
                rs.writeHead(500).end('Internal server error.');
            }
        }
        if (!rq.isLongRequest && !rs.writableEnded) {
            rs.s('Default response.');
        }
    }