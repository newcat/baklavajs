import { IEditor } from "./editor";

export interface IPlugin {
    type: string;
    register(editor: IEditor): void;
}
