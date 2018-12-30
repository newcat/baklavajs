import Editor from "./components/Editor.vue";
export default {
    install(Vue: any, options: any) {
        Vue.component("baklava-editor", Editor);
    }
};
