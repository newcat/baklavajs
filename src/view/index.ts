export { default as Editor } from "./components/Editor.vue";
export * from "./baklavaVuePlugin";
export * from "./viewPlugin";

import Vue from "vue";
import { ViewPlugin } from "./viewPlugin";
import { BaklavaVuePlugin } from "./baklavaVuePlugin";
import { Editor } from "../core";

export function createBaklava(element: Element): ViewPlugin {

    Vue.use(BaklavaVuePlugin);

    const editor = new Editor();
    const plugin = new ViewPlugin();
    editor.use(plugin);

    new Vue({
        render: h => h("baklava-editor", {
            props: {
                model: editor
            }
        }),
    }).$mount(element);

    return plugin;

}
