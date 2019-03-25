import { IPlugin, Editor } from "../core";

export class ViewPlugin implements IPlugin {

    public editor!: Editor;
    public panning = { x: 0, y: 0 };
    public scaling = 1;

    register(editor: Editor): void {
        this.editor = editor;
        // TODO: Save / load hooks
    }

}
