import { IEditor } from "../../../baklavajs-core/types";

export interface IStep {
    type: string;
    undo(editor: IEditor): void;
    redo(editor: IEditor): void;
}
