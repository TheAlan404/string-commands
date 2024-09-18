import { unloadModule } from "./unloadModule";
import { forEachFile } from "./forEachFile";

export const recursiveImport = (path: string, exts: string[] = [".js"]) => forEachFile(
    path,
    exts,
    async (file) => await import(file.path),
);
