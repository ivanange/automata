<template>
  <b-button @click.prevent="run">{{this.name}}</b-button>
</template>

<script>
export default {
  name: "operation",
  props: {
    name: String,
    function: String,
    static: Boolean,
    args: Array
  },
  data() {
    return {};
  },
  computed: {
    message: function() {
      return {
        static: this.static,
        operation: this.function,
        args: this.args || []
      };
    }
  },
  methods: {
    run(evt) {
      if(this.$root.af.currentState) {
        this.$root.worker.postMessage(this.message);
      }
      else {
            this.$data.modal = "Error : No Automaton has been defined";
          this.$bvModal.show("modal");
      }
      
    }
  }
};
</script>

