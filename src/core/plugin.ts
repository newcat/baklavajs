import { Editor } from "./editor";

export interface IPlugin {
    register(editor: Editor): void;
}
