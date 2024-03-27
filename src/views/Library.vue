<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'
import { service, getAttachmentUrlById } from '@/helpers/api'
import Search from '@/components/Search/Search.vue'
import IconLink from '@/components/IconLink/IconLink.vue'
import LastViewedCarusel from  '@/components/LastViewedCarusel/LastViewedCarusel.vue'
import ArrowRightIcon from '@/assets/icons/Side=Right.svg'
import ChevronLeftIcon from '@/assets/icons/Type=Left.svg'
import ChevronRightIcon from '@/assets/icons/Type=Right.svg'
import Loader from '@/components/Loader/Loader.vue'
import Editor from '@/components/Editor/Editor.vue'


const { locale } = useI18n()
const { mdAndUp } = useDisplay()
const swiperRef = ref()
const searchInProgress = ref(false)
const caruselSlides = ref([])
const rawNewsList = ref([])
const newsLoader = ref(false)

const newsList = computed(() => {
  return rawNewsList.value.map((el) => {
    return {
      title: locale.value === 'de' ? el.titleDe : el.titleEn,
      content: locale.value === 'de' ? el.contentDe : el.contentEn,
      createdAt: el.createdAt
    }
  })
})
const nextSlide = () => {
  if (swiperRef.value) swiperRef.value.swiper.slideNext()
}

const prevSlide = () => {
  if (swiperRef.value) swiperRef.value.swiper.slidePrev()
}

const getSlides = async () => {
  try {
    const { data } = await service.get('/articles', {
      params: {
        sort: ['createdAt', 'desc']
      }
    })
    caruselSlides.value = data
  } catch (e) {
    console.log('error %o', e)
  }
}

const getNews = async () => {
  newsLoader.value = true
  try {
    const { data } = await service.get('/news', {
      params: {
        page: 0,
        size: 2,
        sort: ['createdAt', 'desc']
      }
    })

    rawNewsList.value = data.content
  } catch (e) {
    console.log('error %o', e)
  }
  newsLoader.value = false
}
getSlides()
getNews()

</script>

<template>
  <Search
    @searchInProgress="(val) => searchInProgress = val"
  />

  <div v-if="!searchInProgress" class="limited-width w-100">
    <!-- NEWS -->
    <div class="news">
      <div class="header-md-6 header-sm-2 color-black d-flex flex-wrap justify-space-between">
        <div>{{ $t('library.news') }}</div>
        <IconLink
          icon="right"
          href="/news"
          class="uppercase"
        >
          {{ $t('library.showMoreNews') }}
        </IconLink>
      </div>
      <div v-if="newsLoader">
        <Loader/>
      </div>
      <div v-else class="tiles">
        <div class="tile" v-for="(news) in newsList" :key="news.title">
          <div class="header-6 color-black">{{ news.title }}</div>
          <div class="tile-text font-type-b1 color-black">
            <Editor :content="news.content" display/>
          </div>
          <div class="mt-6 font-type-b5 color-grey-4">
            {{ news.createdAt }}
          </div>
        </div>
      </div>
    </div>

    <div class="lastViewed">
      <LastViewedCarusel />
    </div>

    <!-- ARTICLES -->
    <div class="articles" v-if="caruselSlides.length">
      <div class="color-black">
        <div class="articles-wrapper flex align-center">
          <h2 class="header-md-6 header-sm-2">{{ $t('library.articles') }}</h2>
          <div class="articles-wrapper-buttons d-flex align-end">
            <button
              @click="prevSlide"
              class="chevron-btn d-inline-block d-md-flex align-center justify-center"
            >
              <ChevronLeftIcon aria-hidden="true"/>
              <span class="sr-only">
                {{ $t('library.prevSlide') }}
              </span>
            </button>
            <button
              @click="nextSlide"
              class="chevron-btn d-inline-block ml-4 d-md-flex align-center justify-center"
            >
              <ChevronRightIcon class="black-icon" aria-hidden="true"/>
              <span class="sr-only">
                {{ $t('library.nextSlide') }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div
    v-if="!searchInProgress"
    class="limited-width w-100 pl-md-12 pl-4 mb-md-15 mb-8 pb-0 pb-md-5"
  >
    <swiper-container
      class="ml-i"
      id="swiper-articles"
      ref="swiperRef"
      slides-per-view="auto"
      space-between="16"
      grab-cursor
      :keyboard="{
        enabled: true,
        onlyInViewport: true
      }"
      :breakpoints="{
        1000: {
          spaceBetween: 48
        }
      }"
    >
      <swiper-slide
        class="articles-tile"
        v-for="(slide, index) in caruselSlides" :key="index"
        tabindex="0"
      >
        <a :href="slide.contentUrl" target="_blank">
          <div
            class="articles-tile-image"

            :style="{
              'background-image': `url(${getAttachmentUrlById(slide.croppyImageId)})`,
              'background-size': 'contain'
            }"
          >
          </div>
          <div class="articles-tile-text font-type-md-b1 font-type-sm-b4">
            <div class="title word-break-all">
              {{ slide.title }}
            </div>
            <div class="arrow">
              <ArrowRightIcon
                class="white-icon" aria-hidden="true"
                :width="mdAndUp ? '32px' : '24px'"
                :height="mdAndUp ? '32px' : '24px'"
              />
            </div>
          </div>
        </a>
      </swiper-slide>
    </swiper-container>
  </div>
</template>

<style lang="scss" scoped>
  .news {
    margin: 80px 48px 80px 48px;

    .tiles {
      margin-top: 64px;
      display: flex;
      gap: 48px;

      .tile {
        flex: 0 1 calc(50% - 24px);
        padding: 48px;
        background-color: $color-grey-8;

        &-text {
          margin-top: 24px;
          margin-bottom: 24px;
        }
      }
    }
  }

  .lastViewed {
    padding: 32px 48px 32px 48px;
  }

  .articles {
    margin: 80px 48px 62px 48px;

    .chevron-btn {
      border: 1px solid $color-black;
      width: 48px;
      height: 48px;
      box-sizing: content-box;
    }

    &-wrapper {
      display: flex;
      justify-content: space-between;
      margin-bottom: 64px;
    }

    &-tile {
      display: inline-block;
      overflow: hidden;
      width: 384px;
      background-color: #FFFFFFFF;
      border: #FFFFFFFF 1.5px solid;

      &:hover, &:focus {
        border: $color-primary-100 1.5px solid;

        .articles-tile-image {
          transform: scale(1.06);
        }

        .arrow {
          transform: translateX(8px);
        }
      }
      &-image {
        transition: transform .3s ease-out;
        height: 384px;
        width: 100%;
      }

      &-text {
        display: flex;
        position: relative;
        z-index: 1;
        height: 64px;
        justify-content: space-between;
        background-color: $color-black;
        padding: 16px;

        .title {
          color: #FFFFFFFF;
          height: 64px;
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
        .arrow {
          transition: transform .3s ease-out;
          margin-left: 16px;
          width: 32px;
          height: 32px;
          align-self: center;
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

    .lastViewed {
      padding: 32px 16px 32px 16px;
    }
    .articles {
      margin: 32px 16px 32px 16px;

      .chevron-btn {
        border: 1px solid $color-black;
        width: 24px;
        height: 24px;
        box-sizing: content-box;
      }

      &-wrapper {
          margin-bottom: 24px;
      }

      &-tile {
        width: 100%;
        max-width: 220px;

        &-image {
          transition: transform .3s ease-out;
          height: 220px;
          width: 100%;
        }

        .arrow {
          margin-left: 8px;
          width: 24px;
          height: 24px;
          background-size: 24px;
        }

        &-text {
          padding: 14px 16px;
          height: 32px;
          .title {
            height: 32px;
          }
        }
      }
    }

  }
</style>
