<template>
  <div>
    <b-form @submit="onSubmit">
      <b-form-group label="Cloture par : " class="text-left">
        <b-form-select v-model="selected" :options="options" size="sm" class="mt-3"></b-form-select>
      </b-form-group>

      <b-form-group
        description="You may use string :'this' to reference the current automaton "
        class="text-left"
      >
        <b-form-input
          id="automata"
          v-model="automata"
          type="text"
          required
          placeholder="'this', (a+b)*.c, (ab)*.fun"
        ></b-form-input>
      </b-form-group>

      <b-button type="submit" variant="primary" class="py-2 px-4 rounded-lg">Go</b-button>
    </b-form>
  </div>
</template>

<script>
export default {
  name: "closures",
  data() {
    return {
      selected: 1,

      options: [
        { value: 1, text: "Union Ensembliste" },
        { value: 2, text: "Intersection Ensembliste" },
        { value: 3, text: "Concatenation" }
      ],
      automata: ""
    };
  },
  computed: {
    operation: function() {
      return this.selected == 1
        ? "clotureUnion"
        : this.selected == 3
        ? "clotureConcatenation"
        : "clotureIntersection";
    },
    message: function() {
      return {
        static: true,
        operation: this.operation,
        args: this.automata
          .split(",")
          .map(el => el.trim())
          .filter(el => el !== ""),
        map: "fromRegex",
        nospread: true
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

