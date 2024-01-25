import { unloadModule } from "./unloadModule";
import { forEachFile } from "./forEachFile";

export const recursiveUnload = (path: string, exts: string[] = [".js"]) => forEachFile(
    path,
    exts,
    async (file) => unloadModule(file.path),
);
