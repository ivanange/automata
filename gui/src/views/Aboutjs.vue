<template>
  <b-tabs>
    <b-tab title="AF.js" active>
      <prism language="javascript" :code="code.js.AF"></prism>
    </b-tab>
    <b-tab title="bootstrap.js">
      <prism language="javascript" :code="code.js.bootstrap"></prism>
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
