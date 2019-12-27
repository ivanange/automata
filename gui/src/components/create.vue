<template>
  <div>
    <b-form-group class style="width:300px">
      <b-form-select v-model="selected" :options="options" class="mt-3"></b-form-select>
    </b-form-group>
    <b-form @submit="onSubmit" v-if="show" inline class="flex-wrap justify-content-center">
      <div v-if="selected ===1">
        <b-form-input
          id="alphabet"
          v-model="form.alphabet"
          type="text"
          required
          placeholder="alphabet"
          class="m-2"
        ></b-form-input>

        <b-form-input
          id="states"
          v-model="form.states"
          type="text"
          required
          placeholder="states"
          class="m-2"
        ></b-form-input>

        <b-form-input
          id="initialState"
          v-model="form.initialState"
          type="text"
          required
          placeholder="initial state"
          class="m-2"
        ></b-form-input>

        <b-form-input
          id="finalStates"
          v-model="form.finalStates"
          type="text"
          required
          placeholder="final states"
          class="m-2"
        ></b-form-input>

        <b-form-input
          id="transitions"
          v-model="form.transitions"
          type="text"
          required
          placeholder="transitions: [state, symbol, state],[state, symbol, state]"
          class="m-2"
        ></b-form-input>

        <div class="w-100">
          <b-form-input
            id="transitions"
            v-model="form.transitions"
            type="text"
            required
            placeholder="transitions: [state, symbol, state],[state, symbol, state]"
            class="m-2 w-100"
          ></b-form-input>
        </div>
      </div>

      <b-form-input
        v-else
        id="regex"
        v-model="regex"
        type="text"
        required
        placeholder="(a.b)*+c"
        class="m-2 w-75 text-center"
      ></b-form-input>

      <div class="w-100">
        <b-button type="submit" variant="primary" class="w-auto mx-auto px-5 py-2 my-3">Create</b-button>
      </div>
    </b-form>
  </div>
</template>

<script>
export default {
  name: "create",
  data() {
    return {
      form: {
        alphabet: "",
        states: "",
        initialState: "",
        finalStates: "",
        transitions: ""
      },

      selected: 1,

      options: [
        { value: 1, text: "From properties" },
        { value: 2, text: "From regular expression" }
      ],

      show: true,
      static: true,
      regex: "",
      data: {
        alphabet: new Set(),
        states: new Set(),
        initialState: "",
        finalStates: new Set(),
        transitions: []
      }
    };
  },
  computed: {
    operation: function() {
      return this.selected == 1 ? "make" : "fromRegex";
    },
    message: function() {
      return {
        static: this.static,
        operation: this.operation,
        args: [this.selected == 1 ? this.data : this.regex]
      };
    }
  },
  watch: {
    form: {
      handler(val) {
        this.data.alphabet = new Set(
          this.form.alphabet.split(",").map(el => el.trim())
        );
        this.data.states = new Set(
          this.form.states.split(",").map(el => el.trim())
        );
        this.data.finalStates = new Set(
          this.form.finalStates.split(",").map(el => el.trim())
        );
        this.data.initialState = this.form.initialState;
        this.data.transitions = this.form.transitions
          .split(/\s*(?:\[(.+?)\])\s*/)
          .map(el => el.split(",").map(el => el.trim()))
          .filter(el => el.length === 3);
      },
      deep: true
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

