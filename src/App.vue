<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const layoutComp = computed(() => {
  const layout = route?.meta?.layout
  if (layout) {
    return layout
  }
  return 'DefaultLayout'
})

</script>

<template>
  <component v-if='layoutComp' :is="layoutComp">
    <router-view/>
  </component>
  <div v-else></div>
</template>

<style lang="scss" scoped>
</style>
