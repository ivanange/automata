import Vue from "vue";
import BootstrapVue from "bootstrap-vue";
import App from "./App.vue";
import Worker from "./worker.js";
import router from "./router";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import "../../dist/bootstrap";
import * as vis from "vis-network";
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
  mounted() {


  },
  watch: {
    message: function () {
      this.handler()
    },
    af(v) {
      this.visualization(v);
    }
  },
  methods: {
    handler() {
      let message = this.message;
      this.$emit(message.callerId, message);
    },
    getsvg() {
      var canvas = document.getElementById("canvas"),
        ctx = canvas.getContext("2d"),
        image = new Image();

      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      function step() {
        ctx.drawImage(image, 0, 0, 80, 80);
        window.requestAnimationFrame(step);
      }

      window.requestAnimationFrame(step);
    },
    visualization(auto, id = "representation") {
      let g = new Set(auto.states);
      let h = [{
        id: -1,
        label: "",
        title: `state `,
        color: "rgba(0,0,0,0)"
      }];
      let t = [];

      for (let i of g.values()) {
        let lh = {
          id: i + "",
          label: `${i}`,
          title: `state ${i}`,
          color: "#FFF"
        };
        let isInitial = false;
        if (auto.finalStates.contains(i)) {
          lh.color = {
            border: "#007BFF",
            background: "#ffffff"
          };
          lh.title = `finale state ${i}`;

          if (auto.initialState instanceof Set) {
            if ("" + auto.initialState == i + "") {
              lh.title = `initiale and finale state ${i}`;
              isInitial = true;
            }
          } else {
            if ("" + auto.initialState == i + "") {
              lh.title = `initiale and finale state ${i}`;
              isInitial = true;
            }
          }
        } else {
          if (auto.initialState instanceof Set) {
            if (auto.initialState.has(i)) {
              lh.title = "initiale " + lh.title;
              isInitial = true;
            }
          } else {
            if ("" + auto.initialState == i + "") {
              lh.title = "initiale " + lh.title;
              isInitial = true;
            }
          }
        }
        if (isInitial) {
          t.push({
            from: -1,
            to: i + "",
            title: "Init state"
          });
        }
        h.push(lh);
      }

      for (let i of auto.transitions.values()) {
        t.push({
          from: i[0],
          to: i[2],
          selectionWidth: function (width) {
            return width + 2;
          },
          hoverWidth: function (width) {
            return width + 1;
          },
          title: `transition from state ${i[0]} to state ${i[2]}`,
          label: i[1] ? i[1] : "ɛ"
        });
      }

      var nodes = new vis.DataSet(h);

      // create an array with edges
      var edges = new vis.DataSet(t);

      // create a network
      var container = document.getElementById(id);
      var data = {
        nodes: nodes,
        edges: edges
      };
      var options = {
        edges: {
          arrows: "to",
          color: "black"
        },
        nodes: {
          shape: "circle",
          margin: 7
        }
      };
      var network = new vis.Network(container, data, options);
    }
  },
  render: h => h(App)
}).$mount("#app");

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