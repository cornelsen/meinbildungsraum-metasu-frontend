<script setup>
import CloseIcon from '@/assets/icons/CloseRound.svg'
const emit = defineEmits(['close'])
defineProps({
  label: { type: String, default: '' },
})
</script>

<template>
    <div class="tag header-10 color-black">
      <span>{{ label }}</span>
      <button
        class="link"
        @click="emit('close')"
        type="button"
      >
        <CloseIcon class="close-icon link black-icon" aria-hidden="true"/>
        <div class="sr-only">{{ $t('common.removeTag') }} {{ label }}</div>
      </button>
    </div>
</template>

<style lang="scss">
  .tag {
    flex-shrink: 0;
    display: block;
    padding: 8px 12px;
    background-color: $color-grey-6;
    font-size: 14px;
    line-height: 16px;

    .close-icon {
      display: inline-block;
      margin-left: 8px;
      margin-bottom: 1px;
      border-radius: 8px;
      width: 12px;
      height: 12px;
      vertical-align: middle;
    }
  }

</style>
