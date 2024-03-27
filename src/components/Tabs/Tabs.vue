<script setup>
import { ref } from 'vue'

const emit = defineEmits(['tab:change'])
const props = defineProps({
  tabs: {type: Array, default: () => []},
  mb: {type: String, default: 'mb-12'},
  fullWidth: {type: Boolean, default: false}
})

const currentTab = ref(props.tabs[0])
const items = ref([])
const changeTab = (tab) => {
  currentTab.value = tab
  if (items.value[getIndexByTabKey(tab.key)]) {
    items.value[getIndexByTabKey(tab.key)].focus()
  }
  emit('tab:change', tab)
}

const getIndexByTabKey = (key) => {
  for(let i = 0; i < props.tabs.length; i += 1) {
    if (props.tabs[i].key === key) {
      return i
    }
  }
  return 0
}

defineExpose({ changeTab })
</script>

<template>
  <div>
    <div class="tabs" :class="mb" role="tablist">
      <button
        v-for="(tab, index) of tabs" :key="index"
        class="tab font-md-button font-type-sm-b3 link animated-border uppercase"
        :class="{
          active: currentTab.key === tab.key,
          'w-100': props.fullWidth,
          'error': tab.error
        }"
        @click.prevent="() => changeTab(tab)"
        ref="items"
        role="tab"
        :aria-selected="currentTab.key === tab.key"
        aria-controls="tab-content"
      >
        {{ tab.name }}
      </button>
    </div>
    <slot name="validation"></slot>
    <div id="tab-content" class="content">
      <slot
        :name="currentTab.key"
      >
      </slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .tabs {
    display: flex;
    flex-basis: 100%;
    gap: 40px;
    border-bottom: 1px solid $color-black;

    .tab {
      display: block;
      outline: none;
      padding: 16px 20px;
      color: $color-black;
      min-width: 179px;
      text-align: center;
      border: 1px solid transparent;

      &:hover, &:focus {
        color: $color-primary-100;
      }
      &.active {
        border: 1px solid $color-black;
        border-bottom: none;
      }

      &.error {
        color: $color-error;
      }
    }
    .animated-border:not(.active) {
      position: relative;
      outline: none;
      border: none;
      box-shadow: none;
      background-image:
        linear-gradient($color-primary-100, $color-primary-100),
        linear-gradient($color-primary-100, $color-primary-100),
        linear-gradient($color-primary-100, $color-primary-100);

      background-position: 0 100%, 0 0, 0 100%;
      background-size: 1px 0%, 0% 1px, 1px 0%;
      background-color: transparent;
      background-repeat: no-repeat;
    }
    .animated-border:before {
      content: '';
      position: absolute;
      z-index: -1;
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;
    }

    .animated-border:hover, .animated-border:focus {
      background-position: 0 100%, 0 0, 0 100%;
      background-size: 1px 0%, 0% 1px, 1px 0%;
      animation: borderAnimation 0.3s linear;
      animation-fill-mode: forwards
    }

    @keyframes borderAnimation {
      0% {
        background-position: 0 100%, 0 0, 100% 0;
        background-size: 1px 0%, 0% 1px, 1px 0%;
      }
      33% {
        background-position: 0 100%, 0 0, 100% 0;
        background-size: 1px 100%, 0% 1px, 1px 0%;
      }
      66% {
        background-position: 0 100%, 0 0, 100% 0;
        background-size: 1px 100%, 100% 1px, 1px 0%;
      }
      100% {
        background-position: 0 100%, 0 0, 100% 0;
        background-size: 1px 100%, 100% 1px, 1px 100%;
      }
    }
  }
  .content {
    color: $color-black;
  }

  @media (max-width: $MAX-WIDTH-MOBILE) {
    .tabs {
      gap: 8px;

      .tab {
        padding: 8px 4px;
        min-width: auto;
        flex: 100%;
        font-weight: 700;
      }
    }
  }
</style>
