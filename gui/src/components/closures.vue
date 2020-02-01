<template>
  <div>
    <b-form @submit.prevent="work">
      <b-form-group label="Closure by : " class="text-left">
        <v-select
          v-model="selected"
          :options="options"
          :reduce="el => el.value"
          size="sm"
          class="mt-3"
        ></v-select>
      </b-form-group>

      <v-select
        v-model="fromregex"
        :options="[{label: 'From regex list', value: true}, {label: 'From saved automata list', value: false}]"
        :reduce="el => el.value"
        size="sm"
        class="mt-3"
        placeholder="From regex or saved automaton"
      ></v-select>

      <b-form-group
        description="You may use keyword 'this' to reference the current automaton "
        class="text-left mt-3"
        v-if="fromregex"
      >
        <b-form-input
          id="automata"
          v-model="automata"
          type="text"
          required
          placeholder="this, (a+b)*.c, (ab)*.fun"
        ></b-form-input>
      </b-form-group>

      <b-form-group
        v-else
        description="select save automata to use from dropdown"
        class="text-left"
      >
        <v-select
          multiple
          v-model="automataList"
          :options="Object.keys(enviroment.saved).map(key => ({ label: key, value: enviroment.saved[key] }) )"
          :reduce="el => el.value"
          size="sm"
          class="mt-3"
        ></v-select>
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
      selected: "clotureUnion",
      options: [
        { value: "clotureUnion", label: "Union" },
        { value: "clotureConcatenation", label: "Intersection" },
        { value: "clotureIntersection", label: "Concatenation" }
      ],
      automata: "",
      callerId: "closures",
      fromregex: true,
      automataList: []
    };
  },
  computed: {
    args: function() {
      return this.fromregex
        ? this.automata
            .split(",")
            .map(el => el.trim())
            .filter(el => el !== "")
        : this.automataList;
    },
    map: function() {
      return this.fromregex ? "fromRegex" : "fromJson";
    },
    message: function() {
      return {
        operation: {
          static: true,
          name: this.selected
        },

        args: this.fromregex
          ? this.automata
              .split(",")
              .map(el => el.trim())
              .filter(el => el !== "")
          : this.automataList,

        callback: {
          map: this.map,
          static: true,
          excludeThis: true
        },
        callerId: this.callerId,
        spread: false
      };
    }
  },
  methods: {
    work(evt) {
      this.post(this.message);
    }
  }
};
</script>

