import Vue from "vue";
import App from "./App.vue";

Vue.config.productionTip = false;

import "./styles.scss";
// import lib from "../dist/lib.js";
import lib from "../src";
Vue.use(lib);

new Vue({
  render: h => h(App),
}).$mount("#app");
