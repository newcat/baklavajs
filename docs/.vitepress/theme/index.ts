import DefaultTheme from "vitepress/theme";
import BaklavaExample from "../components/BaklavaExample.vue";

export default {
    extends: DefaultTheme,
    enhanceApp({ app }) {
        app.component("BaklavaExample", BaklavaExample);
    },
};
