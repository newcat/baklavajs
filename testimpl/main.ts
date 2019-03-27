import Vue from "vue";
import App from "./App.vue";

Vue.config.productionTip = false;

import { BaklavaVuePlugin } from "../src/view";
import "../src/view/styles/all.scss";
Vue.use(BaklavaVuePlugin);

new Vue({
  render: h => h(App),
}).$mount("#app");
