<template>
  <div>
    <span class="d-block text-center h5">Closures</span>
    <b-button-group vertical>
      <operation
        v-for="operation in operations[0]"
        :name="operation.name"
        :key="operation.name"
        :function="operation.function"
        :args="operation.args"
        :static="operation.static"
        class="= my-2 rounded"
      />
    </b-button-group>
    <span class="d-block text-center mt-4 h5">Convertions</span>
    <b-button-group vertical>
      <operation
        v-for="operation in operations[1]"
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
        [
          {
            name: "Complementary",
            function: "clotureComplementation",
            static: true,
            args: ["this"]
          },
          {
            name: "Iteration",
            function: "clotureEtoile",
            static: true,
            args: ["this"]
          },
          {
            name: "Miror",
            function: "clotureMiroir",
            static: true,
            args: ["this"]
          }
        ],
        [
          {
            name: "Complete",
            function: "complete",
            static: false,
            args: []
          },
          {
            name: "AFD",
            function: "toAFD",
            static: false,
            args: []
          },
          {
            name: "AFN",
            function: "toAFN",
            static: false,
            args: []
          },
          {
            name: "EAFN",
            function: "toEAFN",
            static: false,
            args: []
          }
        ]
      ]
    }
  },
  data() {
    return {};
  }
};
</script>

