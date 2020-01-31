import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import App from './App.vue';
import Worker from './worker.js';
import router from './router';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import "../../dist/bootstrap";
import store from "./store";

Vue.use(BootstrapVue);
Vue.config.productionTip = false
const worker = new Worker();
//
const vm = new Vue({
  router,
  store,
  data: {
    worker: worker,
    af: {
      kind: ""
    },
    string: "",
    found: null,
    modal: "HI"
  },
  render: h => h(App)
}).$mount('#app');

window.vm = vm;
window.worker = worker;

worker.onmessage = function (e) {
  let data = e.data;
  console.log(data);
  if (data.status !== "ERROR") {
    if (typeof data.data === "object") {
      vm.$data.af = data.data;
      worker.postMessage({
        static: false,
        operation: "toRegex",
        args: []
      });
      vm.$data.found = null;
    } else if (typeof data.data === "string") vm.$data.string = data.data;
    else vm.$data.found = data.data;

  } else {
    vm.$data.modal = "Error : " + data.data;
    vm.$bvModal.show("modal");
  }
}

/*
      [1, a, 1],       [1, a, 2],       [2, b, 3],       [2, a, 4],       [3, b, 3],       [3, b, 4]

*/