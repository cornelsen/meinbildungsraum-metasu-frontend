<script setup>
import { computed } from 'vue'
import ChevronLeftIcon from '@/assets/icons/Type=Left.svg'
import ChevronRightIcon from '@/assets/icons/Type=Right.svg'
import { useDisplay } from 'vuetify'

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  maxPages: { type: Number, default: 1},
  modelValue: { type: Number, default: 1 }
})

const { mdAndUp } = useDisplay()
const model = computed({
  get () {
    return props.modelValue
  },
  set (value) {
    return emit('update:modelValue', value)
  }
})
const list = computed(() => {
  let  current = model.value,
    last = props.maxPages,
    delta = mdAndUp.value ? 3 : 1,
    left = current - delta,
    right = current + delta + 1,
    range = [],
    rangeWithDots = [],
    l

  for (let i = 1; i <= last; i += 1) {
    if (i == 1 || i == last || i >= left && i < right) {
      range.push(i)
    }
  }

  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1)
      } else if (i - l !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(i)
    l = i
  }

  return rangeWithDots
})

</script>

<template>
  <div class="pagination mt-md-80 mb-md-80 mt-10 mb-10">
    <ul>
      <li class="link mr-4 mt-2">
        <button
          @click="model > 1 ? model -= 1 : model"
          :aria-disabled="model <= 1"
        >
          <ChevronLeftIcon aria-hidden="true"/>
          <span v-if="model > 1" class="sr-only">{{ $t('pagination.prevPage') }} {{ model - 1 }}</span>
        </button>
      </li>
      <li v-for="(val, index) in list" :key="index">
        <button
          @click="val === '...' ? null : model = val"
          class="pagination-block color-black font-type-md-b6 header-sm-9 text-center"
          :class="{current: val === model, link: val !== '...'}"
        >
          <span
            v-if="val === model"
            class="sr-only"
          >
            {{ $t('pagination.currentPage') }}
          </span>
          <span
            v-else
            class="sr-only"
          >
            {{ $t('pagination.goToPage') }}
          </span>
          {{ val }}
        </button>
      </li>
      <li class="link ml-4 mt-2">
        <button
          @click="model < maxPages ? model += 1 : model"
          :aria-disabled="model >= maxPages"
        >
          <ChevronRightIcon class="black-icon" aria-hidden="true"/>
          <span v-if="model < maxPages" class="sr-only">{{ $t('pagination.nextPage') }} {{  model + 1 }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<style lang="scss">
  .pagination {
    ul {
      display: flex;
      align-items: center;
      justify-content: center;
      list-style-type: none;
      padding: 0;
    }

    &-block {
      padding: 14px;
      min-width: 56px;
      height: 56px;
      border: 1px solid transparent;
      &:hover.link,
      &.current {
        border: 1px solid $color-black;
      }
    }
  }
</style>
