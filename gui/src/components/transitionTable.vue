<template>
  <div>
    <b-table-lite
      striped
      hover
      id="table1"
      ref="table"
      :items="table"
      :fields="fields"
      primary-key="states"
    ></b-table-lite>
  </div>
</template>

<script>
export default {
  name: "transitionTable",
  props: {
    transitions: {
      type: Array,
      default: () => []
    },
    states: {
      type: Set,
      default: () => new Set([])
    }
  },
  data() {
    return {
      fields: [],
      table: []
    };
  },
  watch: {
    transitions: function() {
      this.fill();
    },
    states: function() {
      this.init();
    }
  },
  methods: {
    fill() {
      this.transitions.forEach(transition => {
        this.table.forEach(row => {
          let [i, s, q] = transition;
          if (row.states + "" === i + "") {
            console.log(row, q);
            row[q + ""] =
              (row[q + ""].length ? row[q + ""] + "," : "") + (s ? s : "ɛ");
          }
        });
      });
      this.$root.$emit("bv::refresh::table", "table1");
    },
    init() {
      console.log(this.states);
      this.fields = ["states", ...this.states].map(el => el + "");
      this.table = [...this.states].map(state => {
        let row = { states: state + "" };
        this.states.forEach(s => (row[s + ""] = ""));
        return row;
      });
      this.fill();
    }
  },
  mounted: function() {
    this.init();
  }
};
</script>
