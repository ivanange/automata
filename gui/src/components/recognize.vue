<template>
  <div>
    <b-form @submit="onSubmit">
      <b-form-group>
        <b-form-input
          id="word"
          v-model="word"
          type="text"
          :class="'border-'+color"
          required
          placeholder="word"
        ></b-form-input>
      </b-form-group>
      <b-button type="submit" :variant="color">Recognize</b-button>
    </b-form>
  </div>
</template>

<script>
export default {
  name: "recognize",
  data() {
    return {
      word: "",
      static: false
    };
  },
  computed: {
    color: function() {
      return this.$root.found === null
        ? "primary"
        : this.$root.found === false
        ? "danger"
        : "success";
    },
    message: function() {
      return {
        static: this.static,
        operation: "recognize",
        args: [this.word]
      };
    }
  },
  methods: {
    onSubmit(evt) {
      evt.preventDefault();
      this.$root.worker.postMessage(this.message);
    }
  }
};
</script>

