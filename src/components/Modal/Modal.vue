<script setup>
import { useDisplay } from 'vuetify'

const { mdAndUp } = useDisplay()

const props = defineProps({
  width: { type: String, default: undefined }
})
</script>

<template>
  <v-dialog
    :fullscreen="!mdAndUp"
    :width="mdAndUp ? props.width : undefined"
  >
    <slot></slot>
  </v-dialog>
</template>

<style lang="scss" scoped>
</style>
