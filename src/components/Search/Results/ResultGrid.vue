<script setup>
import SearchResultTile from '@/components/Search/SearchResultTile.vue'

defineProps({
  items: { type: Array, default: () => [] },
})

</script>

<template>
  <div>
    <div class="search-results-tiles">
      <template
        v-for="(result, index) in items"
        :key="index"
      >
        <SearchResultTile
          :result="result"
          class="big"
        />
    </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .search-results-tiles {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-around;
    gap: 48px;

    &-swiper-tile {
      width: 300px;
    }
    &-pagination {
      margin-top: 32px;
      margin-bottom: 24px;
    }
  }

  @media (max-width: $MAX-WIDTH-MOBILE) {
    .search-results-tiles {
      gap: 16px;
    }
  }
</style>
