import Vue from "vue";
import App from "./App.vue";

Vue.config.productionTip = false;

import { BaklavaVuePlugin } from "../../baklavajs-plugin-renderer-vue/src";
import "../../baklavajs-plugin-renderer-vue/src/styles/all.scss";
Vue.use(BaklavaVuePlugin);

new Vue({
  render: (h) => h(App)
}).$mount("#app");
