import {UnpackCallbackType} from "./unpack-callback.type";

export interface UnpackOptionsIf {
    archiveFile: string;
    callback: UnpackCallbackType;
    unar: string;
    targetDir: string;
    randomTargetSubDir: string;

    forceOverwrite: boolean;
    forceRename: boolean;
    forceSkip: boolean;
    forceDirectory: boolean;
    noDirectory: boolean;
    noRecursion: boolean;
    copyTime: boolean;
    quiet: boolean;

    password: string;
    passwordEncoding: string;
    encoding: string;

    indexes: number[]|number;
    files: string[];
}


