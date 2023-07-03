(cliArgs) => {

        const args = {};

        for (let i = 0; i < cliArgs.length; i++) {
            if (i < 2) continue; //skip node scriptName args

            let arg = cliArgs[i];
            let [k, v] = arg.split('=');
            if (!v) {
                args[i - 2] = arg; //start write args from main 0
                continue;
            }
            k = k.slice(2); //remove "--" characters
            args[k.trim()] = v.trim();
        }

        return args;
    }