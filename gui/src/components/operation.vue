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
    return {
      callerId: this.name
    };
  },
  computed: {
    message: function() {
      return {
        operation: {
          static: this.static,
          name: this.function
        },
        args: this.args || [],
        callerId: this.callerId
      };
    }
  },
  methods: {
    run(evt) {
      this.post(this.message);
    }
  }
};
</script>

