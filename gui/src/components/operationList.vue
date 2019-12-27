<template>
  <div>
    <b-button-group vertical>
      <operation
        v-for="operation in operations"
        :name="operation.name"
        :key="operation.name"
        :function="operation.function"
        :args="operation.args"
        :static="operation.static"
        class="= my-2 rounded"
      />
    </b-button-group>
  </div>
</template>

<script>
import operation from "@/components/operation.vue";

export default {
  name: "operationList",
  components: {
    operation
  },
  props: {
    operations: {
      type: Array,
      required: false,
      default: () => [
        {
          name: "Cloture par Complementation",
          function: "clotureComplementation",
          static: true,
          args: ["this"]
        },
        {
          name: "Cloture par Etoile",
          function: "clotureEtoile",
          static: true,
          args: ["this"]
        },
        {
          name: "Cloture par Miroir",
          function: "clotureMiroir",
          static: true,
          args: ["this"]
        },
        {
          name: "Completer",
          function: "complete",
          static: false,
          args: []
        },
        {
          name: "To AFD",
          function: "toAFD",
          static: false,
          args: []
        },
        {
          name: "To AFN",
          function: "toAFN",
          static: false,
          args: []
        },
        {
          name: "To EAFN",
          function: "toEAFN",
          static: false,
          args: []
        }
      ]
    }
  },
  data() {
    return {};
  }
};
</script>

