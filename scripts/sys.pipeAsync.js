async (...args) => {
    let r;
    for (let i = 0; i < args.length; i++) r = await eval(`async () => ${args[i]}`) ();
    return r;
}