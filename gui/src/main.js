import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import App from './App.vue';
import router from './router';
import Worker from './worker.js';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import "../../dist/bootstrap";
import store from "./store";
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css';


Vue.component('v-select', vSelect);

Vue.use(BootstrapVue);
Vue.config.productionTip = false;

const worker = new Worker();
const vm = new Vue({
  router,
  store,
  data: {
    worker: worker,
    af: {},
    regex: "",
    message: null,
    modal: "HI"
  },
  watch: {
    message: function () {
      this.handler()
    },
  },
  methods: {
    handler() {
      let message = this.message;
      this.$emit(message.callerId, message);
    }
  },
  render: h => h(App)
}).$mount('#app');

window.vm = vm;
window.worker = worker;

worker.onmessage = function (e) {
  let data = e.data;
  console.log(data);
  if (data.status !== "ERROR") {
    vm.$data.message = data;
  } else {
    vm.$data.modal = "Error : " + data.data;
    vm.$bvModal.show("modal");
  }
}