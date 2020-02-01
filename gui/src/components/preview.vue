<template>
  <div>
    <h2>Representation graphique</h2>
    <div ref="representation" id="representation" style="min-height: 250px" class="w-100"></div>
    <b-button @click="get_image">image</b-button>
  </div>
</template>

<script>
export default {
  methods: {
    convertCanvasToImage(canvas) {
      var image = new Image();
      image.src = canvas.toDataURL("image/svg+xml");
      return image;
    },
    get_image() {
      let automate = this.$refs.representation.querySelector("canvas");
      if (automate) {
        let img = this.convertCanvasToImage(automate);

        let a = document.createElement("a");
        a.href = img.src;
        a.download = "automate_" + this.$root.af.name;
        a.click();
        setTimeout(() => {
          URL.revokeObjectURL(img);
        }, 300);
      }
    }
  }
};
</script>

<style>
</style>