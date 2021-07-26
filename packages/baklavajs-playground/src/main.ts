import { createApp } from "vue";
import App from "./App.vue";

import { BaklavaVuePlugin } from "../../baklavajs-plugin-renderer-vue/src";
import "../../baklavajs-plugin-renderer-vue/src/styles/all.scss";
import "./test.css";

const app = createApp(App, {});
app.use(BaklavaVuePlugin);
app.mount("#app");
