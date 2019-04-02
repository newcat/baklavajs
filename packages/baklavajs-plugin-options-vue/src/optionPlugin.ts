import { IPlugin, Editor } from "@baklavajs/core";
import { ViewPlugin } from "@baklavajs/plugin-renderer-vue";
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
