<template>
  <div>
    <b-form @submit.prevent="work">
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
      static: false,
      found: null,
      callerId: "recognize"
    };
  },
  computed: {
    color: function() {
      return this.found === null
        ? "primary"
        : this.found === false
        ? "danger"
        : "success";
    },
    message: function() {
      return {
        operation: {
          static: this.static,
          name: "recognize"
        },
        args: [this.word],
        callerId: this.callerId
      };
    }
  },
  watch: {
    "$root.af": function() {
      this.found = null;
    }
  },
  methods: {
    work(evt) {
      this.post(this.message);
    },
    handler(message) {
      this.found = message.data;
    }
  }
};
</script>

