<script setup>
import { computed } from 'vue'

const emit = defineEmits(['update:modelValue', 'is:focused'])
const props = defineProps({
  label: { type: String, default: '' },
  placeholder: { type: String, default: null },
  modelValue: { type: String, default: '' },
  icon: { type: Object, default: null}
})

const model = computed({
  get () {
    return props.modelValue
  },
  set (value) {
    return emit('update:modelValue', value)
  }
})
</script>

<template>
  <v-text-field
    :label="label"
    class="input"
    v-model="model"
    :placeholder="props.placeholder"
    :append-inner-icon="icon"
    variant="underlined"
    density="default"
    persistent-placeholder
  >
  </v-text-field>
</template>

<style lang="scss" scoped>
.v-input :deep(.v-input__details) {
  display: none;
}
</style>
