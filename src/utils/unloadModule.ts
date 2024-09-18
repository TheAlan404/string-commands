export const unloadModule = (path: string) => {
    let module = require.cache[path];
    if(module) {
        for(let child of module.children) unloadModule(child.id);
    }
    delete require.cache[path];
};
