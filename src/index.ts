import { VueConstructor } from "vue";
import Editor from "./components/Editor.vue";

const Baklava = {
    install(Vue: VueConstructor, args?: any): void {
        Vue.component("baklava-editor", Editor);
        /*Vue.component("baklava-editor", Vue.extend({
            render: (h: any) => h("p", "test")
        }));*/
    }
};

// @ts-ignore
if (typeof window !== "undefined" && window.Vue) {
    // @ts-ignore
    window.Vue.use(Baklava);
}

export default Baklava;
