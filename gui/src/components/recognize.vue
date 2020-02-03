<template>
  <div>
    <b-form @submit.prevent="run">
      <b-form-checkbox
        v-model="advanced"
        name="check-button"
        switch
        size="lg"
        class="mb-2 text-left"
      >Advanced</b-form-checkbox>
      <b-form-group>
        <b-form-input
          id="word"
          v-model="word"
          type="text"
          :class="'border-' + color"
          :required="!advanced"
          placeholder="word"
        ></b-form-input>
      </b-form-group>

      <b-form-group
        description="select save automata to use from dropdown"
        class="text-left my-2"
        v-if="advanced"
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

      <b-form-group class="text-left mt-2">
        <b-form-file
          v-if="advanced"
          id="file"
          v-model="file"
          type="file"
          :class="'border-' + color"
          :required="advanced && !word"
          placeholder="fichier"
        ></b-form-file>
      </b-form-group>
      <b-form-group label="Word delimiter" class="text-left" v-if="advanced">
        <b-form-input
          id="delimiter"
          v-model="delimiter"
          type="text"
          placeholder="delimiter"
          style="width: 100px;"
        ></b-form-input>
      </b-form-group>
      <b-button type="submit" class="my-2" :variant="color">Recognize</b-button>
    </b-form>

    <b-form-textarea
      v-if="advanced"
      id="textarea"
      :value="result"
      placeholder="Enter something..."
      rows="3"
      max-rows="6"
      plaintext
    ></b-form-textarea>
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
      delimiter: null,
      result: " ",
      advanced: false,
      automataList: []
    };
  },
  watch: {
    file() {
      this.get_file(this.file);
    },
    "$root.af": function() {
      this.found = null;
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
  methods: {
    work(evt) {
      this.post(this.message);
    },
    run() {
      if (this.advanced) {
        this.analyze();
      } else {
        this.work();
      }
    },
    clean(text) {
      return text
        .replace(/\r\n|\n\r|\n|\r/gm, "")
        .split(this.delimiter || " ")
        .filter(v => {
          if (v) {
            return v;
          }
        });
    },
    get_file(f) {
      if (f) {
        var reader = new FileReader();
        reader.readAsText(f, "UTF-8");
        reader.onload = evt => {
          this.text = this.clean(evt.target.result);
        };
        reader.onerror = function(evt) {
          alert("error reading file");
        };
      }
    },
    analyze() {
      this.post({
        operation: {
          static: true,
          name: "recognizeText"
        },
        args: [
          this.word ? this.clean(this.word) : this.text,
          this.automataList
        ],
        callerId: "analyze",
        callback: {
          map: "fromJson",
          static: true,
          excludeThis: true,
          argIndex: 1
        }
      });
    },
    analyzeHandler(message) {
      this.result = message.data.join("\n");
    },
    handler(message) {
      this.found = message.data;
    }
  },
  created() {
    this.$root.$on("analyze", this.analyzeHandler);
  }
};
</script>
