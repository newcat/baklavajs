import { Editor } from "@baklavajs/core";

export interface IStep {
    type: string;
    undo(editor: Editor): void;
    redo(editor: Editor): void;
}
