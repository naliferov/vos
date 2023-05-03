async (path, userName, user) => {
    if (userName === 'root') return true;

    const perms = user._sys_ ? (user._sys_.permissions || {})  : {};

    if (path[0] === 'users') {
        if (path[1] !== userName) {

            if (perms.changeOtherUsers) return true;

            return "You can't change other users namespaces.";
        }
        if (path[2] === '_sys_') {
            return "You can't change system data.";
        }
    } else {
        if (perms.changeSys) return true;

        return "You can't change system namespaces.";
    }
    return true;
}