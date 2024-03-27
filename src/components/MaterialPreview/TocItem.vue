<script setup>
import { ref, computed } from 'vue'
import TocItem from './TocItem.vue'

const emit = defineEmits(['expand:current'])

const props = defineProps({
  toc: { type: Object, default: () => {} },
})

const current = computed(() => props.toc.active)

const expanded = ref(false)

if (current.value) {
  emit('expand:current')
}

</script>

<template>
  <ul :class="toc.level === 1 ? 'root-level font-type-b1': current ? 'font-type-b3' : 'font-type-b4'">
    <li class="flex justify-space-between">
      <div class="headline"
          @click="expanded = !expanded"
          :class="{ 'expanded': toc.items.length === 0 || expanded, 'link':  toc.items.length > 0 }"
        >{{ toc.title }}
      </div>
      <div v-if="toc.level !== 1" class="pages text-decoration-none">{{ toc.pageFrom }}-{{ toc.pageTo }}</div>
    </li>
    <li v-show="expanded" v-if="toc.items.length">
      <TocItem
        v-for="(child, index) in toc.items"
        :toc="child" :key="index"
        @expand:current="() => { expanded = true; emit('expand:current') }"/>
    </li>
  </ul>
</template>

<style lang="scss" scoped>
ul {
  display: flex;
  flex-direction: column;
  list-style-type: none;
  padding: 0;
  margin-left: 56px;
  &.root-level {
    margin-left: 0;
  }
  li {
    margin-top: 24px;
    width: 100%;
    &:not(:first-child) {
      margin-top: 0;
    }

    .headline:not(.expanded) {
        border-bottom: 1px solid $color-black;
    }
    .link:hover {
      color: $color-primary-100;
    }
  }
}

.pages {
  color: $color-grey-4
}

@media (max-width: $MAX-WIDTH-MOBILE) {
  ul {
    margin-left: 16px;
  }
  ul:first-child {
    &.root-level {
      li:first-child {
        margin-top: 0;
      }
    }
  }
}
</style>