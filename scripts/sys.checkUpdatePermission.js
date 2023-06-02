async (path, userName, user) => {
    if (userName === 'root') return true;

    let perms = user?._sys_?.permissions;
    if (!perms) perms = {};

    if (path[0] === 'secrets') {
        return "You can't change secrets.";
    }

    if (path[0] === 'users') {

        if (path[1] !== userName) {
            if (perms.changeOtherUsers) return true;

            return "You can't change other users namespaces.";
        }
        if (path[2] === '_sys_') {
            return "You can't change system data.";
        }
        return true;
    } else {
        if (perms.changeSys) return true;

        return "You can't change system namespaces.";
    }
}