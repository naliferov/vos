async () => {

    return async () => {

        const nodeVer = '19.6.0';
        const nodeFName = `node${nodeVer}.tar.xz`
        const nodeExtractedDir = `node-v${nodeVer}-linux-x64`;
        const nodeBinPath = `${nodeExtractedDir}/bin/node`;

        if (!s.os) return;
        const os = new s.os;

        if (!await s.fs.exists(nodeFName)) {
            s.l(`download node ${nodeFName}`);
            const http = new (await s.f('94a91287-7149-4bbd-9fef-1f1d68f65d70'));
            await http.getFile(`https://nodejs.org/dist/v${nodeVer}/node-v${nodeVer}-linux-x64.tar.xz`, nodeFName);
        }
        if (!await s.fs.exists(nodeExtractedDir)) {
            s.l(`extract node ${nodeFName}`);
            await os.ex(`tar -xf ${nodeFName}`);
        }

        //delete s.users['алексей'];

        const listenLog = async () => {
            //l.onMessage((msg) => connectedSSErs ? connectedSSErs.write(`data: ${msg} \n\n`) : '');
            //const cmd = `tail -f ${fname}.log`;
            //(new OS(l)).run(cmd, false, false, (proc) => {
            //}, (code) => console.log('tail -f stop. code: ', code));
        }
        //const createEventSource = (url, netNodeName) => { const x = new s.EventSource(url); x.onmessage = e => console.log(netNodeName + ':', e.data); return x; }
        const deliverDir = async (ssh, name) => {
            const zipName = name + '.zip';
            await os.ex(`zip -vr ${zipName} ${name} -x "*.DS_Store"`);

            const r = await ssh.execCommand('unzip');
            if (r.stderr.includes('unzip: command not found')) {
                await ssh.execCommand('apt install unzip');
            }
            await ssh.putFile(zipName, `./${zipName}`);
            await ssh.execCommand(`unzip -o ./${zipName}`);
        }

        const checkForNecessaryFiles = async (node) => {
            let ls = (await node.ssh.execCommand('ls')).stdout.split('\n');
            if (!ls.includes('node')) {
                s.l('Upload nodejs.');
                await node.ssh.putFile(`${nodeExtractedDir}/bin/node`, `./node`);
                await node.ssh.execCommand('chmod +x node');
                s.l('Nodejs uploaded.');
            }
            if (!ls.includes('node_modules')) {
                s.l('Upload node_modules.');
                await deliverDir(node.ssh, 'node_modules');
                s.l('Node_modules uploaded.');
            }
            //todo create other dirs
            if (!ls.includes('state')) await node.ssh.execCommand('mkdir state');

            ls = (await node.ssh.execCommand('ls state')).stdout.split('\n');
            if (!ls.includes('secrets.json')) {
                s.l('upload secrets.json');
                await node.ssh.putFile('state/secrets.json', `./state/secrets.json`);
            }

            //await node.ssh.putFile('state/secrets.json', `./state/secrets.json`); s.l('secrets');
        }

        const { NodeSSH } = await import('node-ssh');
        for (let nodeName in s.net) {

            const node = s.net[nodeName];
            if (!node.isActive) continue;
            if (!node.http) {
                const url = node.host ? 'https://' + node.host : 'http://' + node.ip;
                s.defObjectProp(node, 'http', new (await s.f('sys.httpClient'))(url));
            }
            if (!node.ssh || !node.ssh.isConnected()) {
                s.defObjectProp(node, 'ssh', new NodeSSH);
                const sshKey = await s.fs.readFile(node.sshKey);
                await node.ssh.connect({
                    host: node.ip,
                    username: node.username,
                    privateKey: sshKey
                });
            }
            await checkForNecessaryFiles(node);

            const { netNodes } = await s.sys.getSecrets();
            const token = netNodes[nodeName];
            const curl = async (port, path, data) => {
                let cmd = `curl -X POST http://127.0.0.1:${port}${path} -d '${JSON.stringify(data)}'`;

                cmd += ` -H "Content-Type: application/json" -H "Cookie: token=${token}"`;
                return node.ssh.execCommand(cmd);
            }
            //add file netId if not exists
            //const r = await curl(80, '/cmd', {cmd: "s.processStop()"}, netNodes[nodeName]); s.l(r);
            //const r = await curl(8080, '/cmd', {cmd: "s.serverRestart(80)"}); s.l(r);
            //const r = await curl(8080, '/cmd', {cmd: "s.l(s.sys.netId, 'test')"}); s.l(r);
            //state update

            //todo sync users and spaces
            const users = ['aliferov']; //'llanosrocas'
            for (let i = 0; i < users.length; i++) {
                continue;

                const userName = users[i];
                const { data } = await node.http.post('/state', { path: ['users', userName] });

                if (s.users[userName]) s.merge(s.users[userName], data);
                else s.users[userName] = data;
                //await s.nodeFS.writeFile(`state/users/${userName}.json`, JSON.stringify(s.users[userName]));
            }

            const mergePath = async (path) => {
                const { netNodes } = await s.sys.getSecrets();

                const v = s.find(path);
                if (!v) return;

                const r = await node.http.post('/merge', { path, v }, { cookie: `token=${netNodes[nodeName]}` });
                console.log(r.data);
            }
            //await node.ssh.putFile('index.js', `./index.js`); s.l('index.js uploaded')

            //mergePath('users.aliferov');
            //mergePath('sys');

            //const r = await curl(80, '/cmd', { cmd: "delete s.sys.rqStateUpdate[s.sys.SYMBOL_FN]" }, netNodes[nodeName]); s.l(r);
            //const r = await curl(80, '/cmd', { cmd: "delete sys.apps.GUI.html[s.sys.SYMBOL_FN]" }, netNodes[nodeName]); s.l(r);

        }
    }
}