<template>
  <div class="home">
    <h1>Create Automaton</h1>
    <create></create>
    <h1 class="my-4">Automaton</h1>
    <div class="row">
      <div class="operations col-3">
        <operationList />
      </div>
      <div class="automaton col-9 py-5 justify-content-center">
        <div class="row justify-content-center">
          <automaton v-if="this.$root.af.currentState" />
          <recognize class="w-75 my-3" />
          <closures class="w-75 my-3" />
        </div>
      </div>
    </div>
    <b-modal id="modal" title="Automaton">
      <p>{{this.$root.modal}}</p>
    </b-modal>
  </div>
</template>

<script>
// @ is an alias to /src
import create from "@/components/create.vue";
import operationList from "@/components/operationList.vue";
import recognize from "@/components/recognize.vue";
import closures from "@/components/closures.vue";
import automaton from "@/components/automaton.vue";

export default {
  name: "home",
  components: {
    create,
    operationList,
    recognize,
    closures,
    automaton
  },
  data() {
    return {};
  }
};
</script>
