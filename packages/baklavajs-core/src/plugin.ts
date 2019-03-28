import { Editor } from "./editor";

export interface IPlugin {
    type: string;
    register(editor: Editor): void;
}
