<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Croppie from 'croppie/croppie'

const props = defineProps({
  options: {type: Object, default: () => {}}
})

let crop = ref({})
const init = () => {
  crop.value = new Croppie(
    document.querySelector('.croppie-cont'),
    Object.assign(props.options, {
      mouseWheelZoom: false,
      enforceBoundary: true,
      minZoom: 0.1,
      maxZoom: 5
    })
  )
}
const destroy =  () => {
  if (crop.value) {
    crop.value.destroy()
  }
}

onMounted(() => {
  init()
})

onUnmounted(() => {
  destroy()
})

defineExpose({crop})
</script>

<template>
  <div class="croppie-cont"></div>
</template>

<style lang="scss">
  .croppie-cont.croppie-container {
    background-color: #FFF;

    .cr-viewport {
      border: none;
      box-shadow: 0 0 2000px 2000px rgba(255, 255, 255, 0.6);
    }
  }

  @media (max-width: $MAX-WIDTH-MOBILE) {
    .croppie-cont.croppie-container {
      background-color: $color-grey-6;
    }
  }
</style>
