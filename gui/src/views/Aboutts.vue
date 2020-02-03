<template>
  <b-tabs>
    <b-tab title="AF.ts" active>
      <prism language="javascript" :code="code.ts.AF"></prism>
    </b-tab>
    <b-tab title="bootstrap.ts">
      <prism language="javascript" :code="code.ts.bootstrap"></prism>
    </b-tab>
  </b-tabs>
</template>
<script>
import Prism from "vue-prismjs";
import "prismjs/themes/prism.css";
export default {
  components: {
    Prism
  },
  data() {
    return {
      code: require("../assets/code")
    };
  }
};
</script>

<style></style>
