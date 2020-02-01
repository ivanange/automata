<template>
  <div>
    <b-form @submit.prevent="work">
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
      found: null,
      callerId: "recognize",
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
      return this.found === null
        ? "primary"
        : this.found === false
        ? "danger"
        : "success";
    },
    message: function() {
      return {
        operation: {
          static: this.static,
          name: "recognize"
        },
        args: [this.word],
        callerId: this.callerId
      };
    }
  },
  watch: {
    "$root.af": function() {
      this.found = null;
    }
  },
  methods: {
    work(evt) {
      this.post(this.message);
    },
    get_file(f) {
      if (f) {
        var reader = new FileReader();
        reader.readAsText(f, "UTF-8");
        reader.onload = evt => {
          this.text = evt.target.result
            .replace(/\r\n|\n\r|\n|\r/gm, "")
            .split(this.delemiter || " ")
            .filter(v => {
              if (v) {
                return v;
              }
            });
          console.log(this.text);
        };
        reader.onerror = function(evt) {
          alert("error reading file");
        };
      }
    }
  }
};
</script>
