import {UnpackOptionsIf} from "./unpack-options.if";

export interface UnpackListOptionsIf extends UnpackOptionsIf{
    printEncoding: string;
    json : boolean;
    jsonAscii: boolean;
    lsar: string;
}
