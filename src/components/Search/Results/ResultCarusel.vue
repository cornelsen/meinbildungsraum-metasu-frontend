<script setup>
import SearchResultTile from '@/components/Search/SearchResultTile.vue'

defineProps({
  items: { type: Array, default: () => {} },
  maxItems: {type: Number, default: 8}
})

</script>

<template>
    <div class="search-results-tiles">
      <swiper-container
        slides-per-view="auto"
        space-between="12"
        grab-cursor
        class="pa-1 ml-1"
        :keyboard="{
          enabled: true,
          onlyInViewport: true
        }"
        :breakpoints="{
          1200: {
            spaceBetween: 48
          }
        }"
      >
        <swiper-slide
          class="search-results-tiles-swiper-tile"
          v-for="(result, index) in items.length > maxItems ? items.slice(0, maxItems) : items"
          :key="index"
        >
        <SearchResultTile
          :result="result"
          class="small"
        />
        </swiper-slide>
      </swiper-container>
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
      margin-bottom: 24px;
    }
  }

  @media (max-width: $MAX-WIDTH-MOBILE) {
    .search-results-tiles {
      gap: 12px;
      &-swiper-tile {
        width: 156px;
      }
    }
  }
</style>
