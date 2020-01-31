import Vue from "vue";
import BootstrapVue from "bootstrap-vue";
import App from "./App.vue";
import Worker from "./worker.js";
import router from "./router";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import "../../dist/bootstrap";
import * as vis from "vis-network";
import AF from "../../dist/AF";
Vue.use(BootstrapVue);
Vue.config.productionTip = false;
const worker = new Worker();
//
const vm = new Vue({
  router,
  data: {
    worker: worker,
    af: {
      kind: ""
    },
    string: "",
    found: null,
    modal: "HI"
  },
  mounted() {
    let A = new AF(new Set([1, 2, 3, 4]), 1, new Set([4]), new Set("ab"), [
      [1, "a", 1],
      [1, "a", 2],
      [2, "b", 3],
      [2, "a", 4],
      [3, "b", 3],
      [3, "b", 4]
    ]);

    console.log(A);
    this.visualization(A, "representation");
  },
  watch: {
    af(v) {
      this.visualizatio(v);
    }
  },
  methods: {
    visualization(auto, id = "representation") {
      let g = new Set(auto.states);
      let h = [];
      for (let i of g.values()) {
        h.push({
          id: i,
          label: `${i}`,
          title: `state ${i}`,
          arrows: "from;to;middel"
        });
      }
      let t = [];
      for (let i of auto.transitions.values()) {
        t.push({
          from: i[0],
          to: i[2],
          selectionWidth: function(width) {
            return width + 2;
          },
          hoverWidth: function(width) {
            return width + 1;
          },
          title: `transition from state ${i[0]} to state ${i[2]}`,
          label: i[1]
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
          arrows: "to"
          //color: "red"
        }
      };
      var network = new vis.Network(container, data, options);
    }
  },
  render: h => h(App)
}).$mount("#app");

window.vm = vm;

window.worker = worker;

worker.onmessage = function(e) {
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
};

/*
      [1, a, 1],       [1, a, 2],       [2, b, 3],       [2, a, 4],       [3, b, 3],       [3, b, 4]

*/
