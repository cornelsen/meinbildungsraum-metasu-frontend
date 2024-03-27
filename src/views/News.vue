<script setup>
import { ref, computed, watch } from 'vue'
import { service } from '@/helpers/api'
import Loader from '@/components/Loader/Loader.vue'
import Pagination from '@/components/Pagination/Pagination.vue'
import Editor from '@/components/Editor/Editor.vue'
import { useI18n } from 'vue-i18n'

const MAX_NEWS_PER_PAGE = 10
const { locale } = useI18n()
const rawNewsList = ref([])
const newsLoader = ref(false)
const page = ref(1)
const totalElements = ref(0)

const newsList = computed(() => {
  return rawNewsList.value.map((el) => {
    return {
      title: locale.value === 'de' ? el.titleDe : el.titleEn,
      content: locale.value === 'de' ? el.contentDe : el.contentEn
    }
  })
})

const getNews = async () => {
  newsLoader.value = true
  try {
    const { data } = await service.get('/news', {
      params: {
        page: page.value - 1,
        size: MAX_NEWS_PER_PAGE,
        sort: ['createdAt', 'desc']
      }
    })

    rawNewsList.value = data.content
    totalElements.value = data.totalElements
  } catch (e) {
    console.log('error %o', e)
  }
  newsLoader.value = false
}

watch(() => page.value, () => getNews())

getNews()
</script>

<template>
  <div class="limited-width w-100">
    <!-- NEWS -->
    <div class="news">
      <h2 class="header-md-6 header-sm-2 color-black flex justify-space-between">
        <div>{{ $t('library.news') }}</div>
      </h2>
      <div v-if="newsLoader">
        <Loader/>
      </div>
      <div v-else class="tiles">
        <div class="tile" v-for="(news) in newsList" :key="news.title">
          <div class="header-6 color-black">{{ news.title }}</div>
          <div class="tile-text font-type-b1 color-black">
            <Editor :content="news.content" display/>
          </div>
        </div>

        <div v-if="totalElements > MAX_NEWS_PER_PAGE">
          <Pagination v-model="page" :maxPages="totalElements ? Math.ceil(totalElements / MAX_NEWS_PER_PAGE) : 0"/>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .news {
    margin: 80px 48px 80px 48px;

    .tiles {
      flex-direction: column;
      margin-top: 64px;
      display: flex;
      gap: 48px;

      .tile {
        flex: 1;
        padding: 48px;
        background-color: $color-grey-8;

        &-text {
          margin-top: 24px;
          margin-bottom: 24px;
        }
      }
    }
  }
  @media (max-width: $MAX-WIDTH-MOBILE) {
    .news {
      margin: 32px 16px 32px 16px;
      .tiles {
        margin-top: 24px;
        display: flex;
        flex-direction: column;
        gap: 32px;

        .tile {
          padding: 20px;
        }
      }
    }
  }
</style>
