const Permissions = (opts = {}) => {
    opts = Object.assign(opts, {
        getPermissions: async (execCtx) => {
            return execCtx.ctx?.user?.permissions || execCtx.ctx?.permissions || execCtx.ctx?.perms;
        },
        getPermissionsSource: async (execCtx) => {
            return execCtx.command.permissions || execCtx.command.perms;
        },
        label: "",
    });

    return {
        before: "checks",
        id: "permissions",
        run: (execCtx, next) => {
            let required = opts.getPermissionsSource(execCtx) || [];
            if(!required.length) return next();
            let posessed = opts.getPermissions(execCtx) || [];
            let { passed, unmet } = Permissions.check(required, posessed);

            if(passed) {
                return next();
            } else {
                execCtx.handler.emit("insufficentPermissions", {
                    ...execCtx,
                    required,
                    posessed,
                    unmet,
                    label: opts.label,
                });
            };
        },
    };
};

/**
 * Checks for permissions
 * @param {string|string[]} required The required permissions to check for
 * @param {string|string[]} posessed The permissions that the user has
 * @returns {{ passed: true } | { unmet: string[], passed: false }}
 */
Permissions.check = (required, posessed) => {
    if(typeof required == "string") required = [required];
    if(typeof posessed == "string") posessed = [posessed];

    let unmet = [];

    for(let perm of required) {
        if(posessed.some((v) => Permissions.compare(perm, v))) {
            continue;
        };

        unmet.push(perm);
    };

    return {
        passed: unmet.length,
        unmet,
    };
};

Permissions.compare = (target, source) => {
    let a = target.split(".");
    let b = source.split(".");

    let wildcard = false;
    return a.every((v, i) => {
        if(wildcard) return true;
        if(b[i] == v) return true;
        if(b[i] == "*") {
            wildcard = true;
            return true;
        };
        return false;
    });
};

export { Permissions };