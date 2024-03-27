<script setup>
import { ref, onBeforeMount } from 'vue'
import TopBar from '@/components/TopBar/TopBar.vue'
import BottomBar from '@/components/Footer/Footer.vue'
import { initAuthorization } from '@/stores/authorization'
import { fetchFiltersDataState } from '@/stores/filters'


const loaded = ref(false)
const init = async () => {
  try {
    // TODO implement store for filters
    await initAuthorization()
    await fetchFiltersDataState()
  } catch (e) {
    console.log(e)
  }
  loaded.value = true
}

onBeforeMount(() => {
  init()
})
</script>

<template>
  <div class="layout">
    <TopBar/>
    <slot v-if="loaded"/>
    <BottomBar class="footer"/>
  </div>
</template>

<style lang="scss" scoped>
  .layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    margin: 0 auto;

    .footer {
      margin-top: auto;
    }
  }
</style>
