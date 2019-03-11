export * from "./model";
export { default as Options } from "./options";
export { NodeBuilder } from "./utility/nodeBuilder";

import Baklava from "./baklava";
import { Editor } from "./model/editor";
import Vue from "vue";

export function createBaklava(element: Element): Editor {

    Vue.use(Baklava);

    const editor = new Editor();

    new Vue({
        render: h => h("baklava-editor", {
            props: {
                model: editor
            }
        }),
    }).$mount(element);

    return editor;

}

export default Baklava;
