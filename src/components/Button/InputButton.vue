<script setup>
import { ref, watchEffect } from 'vue'
const props = defineProps({
  text: { type: String, default: '' },
  active: { type: Boolean, default: false }
})

const isActive = ref(false)
watchEffect(() => {
  isActive.value = props.active
})

</script>
<template>
  <button
    class="input-button"
    :class="{ 'active': isActive, 'color-black': isActive, 'color-grey-4': !isActive }"
  >
    <div class="flex justify-space-between align-end">
      <div class="flex header-md-7 font-type-md-b5 overflow-hidden">
        <div class="input-button-content mr-3 overflow-hidden">
          {{ text }}
        </div>
      </div>
      <div class="flex align-end">
        <slot/>
      </div>
    </div>
  </button>
</template>
<style lang="scss" scoped>
  .input-button {
    padding: 16px 8px;
    width: 100%;
    border-bottom: 1.5px solid $color-black;
    position: relative;
    outline: none;

    &:before {
      content: '';
      transition: width 0.15s cubic-bezier(0.4, 0, 0.2, 1);
      bottom: -1px;
      left: 0;
      height: 1.5px;
      width: 0;
      background: $color-black;
      position: absolute;
    }
    &:focus {
      outline: none;
    }
    &:hover, &:focus, &.active {
      &:before {
        width: 100%;
      }
    }

    &-content {
      text-overflow: ellipsis;
      text-wrap: nowrap;
    }
  }
</style>