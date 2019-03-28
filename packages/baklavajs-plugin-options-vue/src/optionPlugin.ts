import Vue from "vue";
import { IPlugin, Editor } from "../core";
import { ViewPlugin } from "../view";
import * as Options from "./options";

export class OptionPlugin implements IPlugin {

    public type = "OptionPlugin";

    public register(editor: Editor) {
        editor.events.usePlugin.addListener(this, (p) => {
            if (p.type === "ViewPlugin") {
                this.registerOptions(p as ViewPlugin);
            }
        });
        editor.plugins.forEach((p) => {
            if (p.type === "ViewPlugin") {
                this.registerOptions(p as ViewPlugin);
            }
        });
    }

    private registerOptions(viewPlugin: ViewPlugin) {
        Object.entries(Options).forEach(([k, v]) => {
            viewPlugin.registerOption(k, v);
        });
    }

}
