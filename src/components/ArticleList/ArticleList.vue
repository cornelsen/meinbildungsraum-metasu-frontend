<script setup>
defineProps({
  articles: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="list">
    <div
      v-for="(article, index) in articles" :key="index"
      class="list-item"
      >
        <div class="list-item-text color-black">
          <div class="list-item-text-title header-md-4 header-sm-3">{{ article.title }}</div>
          <div class="font-type-md-b1 font-type-sm-b2">{{ article.text }}</div>
        </div>
        <img :src="article.image" alt="placeholder" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .list {
    display: flex;
    flex-direction: column;
    gap: 80px;

    &-item {
      display: flex;
      flex-direction: row-reverse;

      &:nth-child(2n) {
        flex-direction: row;
      }

      &-text {
        background-color: #FFFFFFFF;
        padding: 80px;
        width: 100%;

        &-title {
          margin-bottom: 24px;
        }
      }
    }
  }
  @media (max-width: $MAX-WIDTH-MOBILE) {
    .list {
      gap: 16px;

      &-item {
        flex-direction: column-reverse;

        &:nth-child(2n) {
          flex-direction: column-reverse;
        }
        &-text {
          padding: 16px;

          &-title {
            margin-bottom: 16px;
          }
        }
      }
    }
  }
</style>
