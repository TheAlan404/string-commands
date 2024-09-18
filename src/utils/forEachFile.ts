import { Dirent } from "fs";
import { readdir } from "fs/promises";

export const forEachFile = async (path: string, exts: string[], fn: (f: Dirent) => PromiseLike<void>) => {
    let files = await readdir(path, { withFileTypes: true });
    
    for(let file of files) {
        if(file.isDirectory()) {
            await forEachFile(file.path, exts, fn);
        } else if(exts.some(x => file.name.endsWith(x))) {
            await fn(file);
        }
    }
}
