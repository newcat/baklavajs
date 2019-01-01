import { VueConstructor } from "vue/types";
import Editor from "./components/Editor.vue";

const Baklava = {
    install(Vue: VueConstructor, args?: any): void {
        Vue.component("baklava-editor", Editor);
    }
};

// @ts-ignore
if (typeof window !== "undefined" && window.Vue) {
    // @ts-ignore
    window.Vue.use(Baklava);
}

export default Baklava;
