<template>
  <div>
    <b-form @submit="onSubmit">
      <b-form-group>
        <b-form-input
          id="word"
          v-model="word"
          type="text"
          :class="'border-' + color"
          required
          placeholder="word"
        ></b-form-input>
      </b-form-group>
      <b-form-group>
        <b-form-file
          id="file"
          v-model="file"
          type="file"
          :class="'border-' + color"
          required
          placeholder="fichier"
        ></b-form-file>
      </b-form-group>
      <b-button type="submit" :variant="color">Recognize</b-button>
    </b-form>
  </div>
</template>

<script>
export default {
  name: "recognize",
  data() {
    return {
      word: "",
      static: false,
      file: [],
      text: [],
      delemiter: " "
    };
  },
  watch: {
    file() {
      this.get_file(this.file);
    },
    delemiter() {
      this.get_file(this.file);
    }
  },
  computed: {
    color: function() {
      return this.$root.found === null
        ? "primary"
        : this.$root.found === false
        ? "danger"
        : "success";
    },
    message: function() {
      return {
        static: this.static,
        operation: "recognize",
        args: [this.word]
      };
    }
  },
  methods: {
    onSubmit(evt) {
      evt.preventDefault();
      this.$root.worker.postMessage(this.message);
    },
    get_file(f) {
      if (f) {
        var reader = new FileReader();
        reader.readAsText(f, "UTF-8");
        reader.onload = evt => {
          this.text = evt.target.result.split(this.delemiter || " ");
        };
        reader.onerror = function(evt) {
          alert("error reading file");
        };
      }
    }
  }
};
</script>
