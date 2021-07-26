import { App } from "vue";
import Editor from "./components/Editor.vue";

const Baklava = {
    install(app: App): void {
        app.component("baklava-editor", Editor);
    }
};

export const BaklavaVuePlugin = Baklava;
