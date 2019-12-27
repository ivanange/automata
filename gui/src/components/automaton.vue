<template>
  <div>
    <b-form inline class="flex-wrap justify-content-center">
      <div class="m-2">
        <label>Alphabet :</label>
        <b-form-input :value="this.$root.af.alphabet+''" readonly type="text" size="sm"></b-form-input>
      </div>
      <div class="m-2">
        <label>States :</label>
        <b-form-input :value="this.$root.af.states+''" readonly type="text" size="sm"></b-form-input>
      </div>
      <div class="m-2">
        <label>Initial state :</label>
        <b-form-input :value="this.$root.af.initialState+''" readonly type="text" size="sm"></b-form-input>
      </div>

      <div class="m-2">
        <label>Final states :</label>
        <b-form-input :value="this.$root.af.finalStates+''" readonly type="text" size="sm"></b-form-input>
      </div>
      <div class="m-2">
        <label>Regular expression :</label>
        <b-form-input :value="this.$root.string" readonly type="text" size="sm"></b-form-input>
      </div>
      <div class="m-2">
        <label>Type :</label>
        <b-form-input :value="this.$root.af.kind" readonly type="text" size="sm"></b-form-input>
      </div>
      <transitionTable
        :transitions="this.$root.af.transitions"
        :states="this.$root.af.states"
        class="w-75 my-3"
      />
    </b-form>
  </div>
</template>

<script>
import transitionTable from "@/components/transitionTable.vue";

export default {
  name: "automaton",
  components: {
    transitionTable
  },
  data() {
    return {};
  }
};
</script>
