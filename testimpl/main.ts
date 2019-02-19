import Vue from "vue";
import App from "./App.vue";

Vue.config.productionTip = false;

import lib from "../src";
import "../src/styles/all.scss";
Vue.use(lib);

new Vue({
  render: h => h(App),
}).$mount("#app");
