<template>
  <div>
    <b-form-group class style="width:300px">
      <b-form-select v-model="selected" :options="options" class="mt-3"></b-form-select>
    </b-form-group>
    <b-form @submit.prevent="work" v-if="show" inline class="flex-wrap justify-content-center">
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

      <div class="w-100 d-flex justify-content-end">
        <b-button type="submit" variant="primary" class="w-auto mx-auto px-5 py-2 my-3">Create</b-button>
        <b-button
          id="popover-target-1"
          class="py-2 my-3 mr-3"
          style="height: 40px;"
          outline="secondary"
        >save</b-button>
        <b-popover target="popover-target-1" placement="top" triggers="focus" ref="popup">
          <template v-slot:title>Save current Automaton</template>
          <b-form @submit.prevent="save" class="d-flex justify-content-center p-1 flex-column">
            <b-form-input v-model="name" type="text" placeholder="name" class="my-2"></b-form-input>
            <b-button type="submit" class="mb-2 mx-auto" style="height: 40px; max-width: 70px;">Done</b-button>
          </b-form>
        </b-popover>
      </div>
    </b-form>
  </div>
</template>

<script>
export default {
  name: "create",
  data() {
    return {
      callerId: "create",
      name: "",
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
        operation: {
          static: this.static,
          name: this.operation
        },
        args: [this.selected == 1 ? this.data : this.regex],
        callerId: this.callerId
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
    work(evt) {
      this.post(this.message);
    },
    save() {
      if (this.name) {
        this.post({
          operation: {
            states: false,
            name: "toJson"
          },
          callerId: "save"
        });
      }
    },
    saveHandler(message) {
      console.log(message, this.$refs);
      this.addSaved(  { name: this.name, saved: message.data});
      if (this.$refs.popup) {
        this.$refs.popup.$emit("close");
      }
    }
  },
  created() {
    this.$root.$on("save", this.saveHandler);
  }
};
</script>

