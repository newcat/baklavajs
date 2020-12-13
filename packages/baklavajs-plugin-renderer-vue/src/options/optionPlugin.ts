import { IPlugin, IEditor } from "../../baklavajs-core/types";
import { IViewPlugin } from "../../baklavajs-plugin-renderer-vue/types";
import * as Options from "./options";

export class OptionPlugin implements IPlugin {

    public type = "OptionPlugin";

    public register(editor: IEditor) {
        editor.events.usePlugin.addListener(this, (p) => {
            if (p.type === "ViewPlugin") {
                this.registerOptions(p as IViewPlugin);
            }
        });
        editor.plugins.forEach((p) => {
            if (p.type === "ViewPlugin") {
                this.registerOptions(p as IViewPlugin);
            }
        });
    }

    private registerOptions(viewPlugin: IViewPlugin) {
        Object.entries(Options).forEach(([k, v]) => {
            viewPlugin.registerOption(k, v);
        });
    }

}
