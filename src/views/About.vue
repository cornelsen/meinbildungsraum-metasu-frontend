<script setup>
import { useDisplay } from 'vuetify'
import Button from '@/components/Button/Button.vue'
import ArticleList from '@/components/ArticleList/ArticleList.vue'
import TypeRightIcon from '@/assets/icons/Type=Right.svg'
import CompanyAppleIcon from '@/assets/icons/companies/Apple.svg'
import ArrowRightIcon from '@/assets/icons/Side=Right.svg'


const articles = [
  {
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.',
    image: 'img/article_placeholder.png'
  },
  {
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.',
    image: 'img/article_placeholder.png'
  },
  {
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.',
    image: 'img/article_placeholder.png'
  }
]
const { mdAndUp } = useDisplay()
</script>

<template>
  <div class="info-wrapper">
    <div class="info">
      <h2 class="info-title header-1">{{ $t('about.header') }}</h2>
      <div class="info-text header-md-5 header-sm-8 color-primary-30">
        {{ $t('about.message') }}
      </div>
      <div class="d-flex justify-center">
        <Button
        variant="white"
        :text="$t('about.startButton')"
        :iconRight="mdAndUp ? TypeRightIcon : undefined"
        @click="$router.push('/')"
        />
      </div>
    </div>
  </div>
  <div class="limited-width w-100">
    <div class="about">
      <h2 class="header-md-6 header-sm-2 color-black">
        {{ $t('about.aboutTheProject') }}
      </h2>
      <div class="tiles">
        <div class="tile">
          <div class="tile-text font-type-md-b1 font-type-sm-b2 color-black">
            {{ $t('about.tiles[0].text') }}
          </div>
        </div>
        <div class="tile">
          <div class="tile-text font-type-md-b1 font-type-sm-b2 color-black">
              {{ $t('about.tiles[1].text') }}
          </div>
        </div>
      </div>
      <div class="about-divider"></div>
      <div class="about-numbers color-black flex-wrap">
        <div class="d-flex align-center">
          <div class="about-numbers-cell header-2"><div class="mx-md-10 my-md-2">1</div></div>
          <div class="ml-md-10 ml-8 header-md-3 header-sm-1 d-inline">{{ $t('about.numbers.place') }}</div>
        </div>
        <div class="mt-8 mt-md-0 d-flex align-center">
          <div class="about-numbers-cell header-2"><div class="mx-md-10 my-md-2">182</div></div>
          <div class="ml-md-10 ml-8 header-md-3 header-sm-1 d-inline">{{ $t('about.numbers.materials') }}</div>
        </div>
        <div class="mt-8 mt-md-0 d-flex align-center">
          <div class="about-numbers-cell header-2"><div class="mx-md-10 my-md-2">87</div></div>
          <div class="ml-md-10 ml-8 header-md-3 header-sm-1 d-inline">{{ $t('about.numbers.publishers') }}</div>
        </div>
      </div>
    </div>
  </div>
  <div class="articles">
    <div class="limited-width">
      <div class="articles-wrapper">
        <ArticleList :articles="articles" />
      </div>
    </div>
  </div>
  <div class="limited-width w-100">
    <div class="sources">
      <h2 class="header-md-6 header-sm-2 color-black">
        {{ $t('about.ourSources') }}
      </h2>
      <div class="tiles">
          <div class="tile">
            <div class="header-8 header-sm-5 color-black">Lorem ipsum</div>
            <div class="tile-text mt-2 mt-md-7 font-type-md-b1 font-type-sm-b2 color-black">
              Lorem ipsum dolor sit Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </div>
          </div>
          <div class="tile-white">
            <component
              :is="mdAndUp ? 'div' : 'swiper-container'"
              class="logos mt-6 mt-md-0"
              slides-per-view="auto"
              space-between="12"
              grab-cursor
              :keyboard="{
                enabled: true,
                onlyInViewport: true
              }"
            >
                <component
                  v-for="(index) in 9"
                  :key="index"
                  :is="mdAndUp ? 'div' : 'swiper-slide'"
                  class="company-logo">
                    <CompanyAppleIcon/>
                </component>
              </component>
          </div>
        </div>
    </div>
  </div>
  <router-link to="/" class="go-to-search">
    <div class="flex header-3 header-sm-3 align-center justify-center">
      <div>{{ $t('about.findMore') }}</div>
      <ArrowRightIcon class="go-to-search-icon white-icon" aria-hidden="true"/>
    </div>
  </router-link>
</template>

<style lang="scss" scoped>
  .info {
    padding-top: 160px;
    padding-bottom: 120px;
    background: $color-primary-100;
    border-top: 1px solid $color-primary-80;
    text-align: center;

    min-height: 400px;
    width: 100%;
    border-top: 1px solid $color-primary-80;

    &-title {
      margin-bottom: 24px;
    }
    &-text {
      margin-left: auto;
      margin-right: auto;
      max-width: 1246px;
      margin-bottom: 96px;
    }
  }
  .about {
    margin: 80px 48px 80px 48px;

    &-divider {
      margin-top: 80px;
      border: none;
      border-top: 1.5px solid $color-primary-10;
    }
    &-numbers {
      display: flex;
      justify-content: space-around;
      align-items: center;
      margin-top: 80px;

      &-cell {
        border: 1.5px solid $color-primary-20;
      }
    }
  }
  .tiles {
    margin-top: 64px;
    display: flex;
    gap: 48px;

    .tile {
      flex: 1;
      padding: 48px;
      background-color: $color-grey-8;

      &-white {
        flex: 1;
        margin-top: -40px;
        background-color: #FFFFFFFF;
      }
    }
  }

  .articles {
    background-color: $color-grey-6;
    padding-top: 160px;
    padding-bottom: 160px;
    &-wrapper {
      margin-left: 160px;
      margin-right: 160px;
    }
  }
  .logos {
    display: flex;
    flex-wrap: wrap;
    gap: 48px;
  }
  .sources {
    margin: 104px 48px 104px 48px;
    .tile {
      background-color: #fff;
    }
  }

  .company-logo {
    flex: 1;
    text-align: center;
    border: 1px solid $color-primary-20;
    padding: 22px 48px;
  }

  .go-to-search {
    transition: background-color 0.3s ease;
    background-color: $color-primary-100;
    text-align: center;
    padding: 90px 0;

    &-icon {
      transition: transform .3s ease-out;
      margin-left: 40px;
      transform: scale(1.5);
    }

    &:hover, &:focus {
      outline: none;
      background-color: $color-black;

      .go-to-search-icon {
        transform: scale(1.5) translateX(12px);
      }
    }
  }

  @media (max-width: $MAX-WIDTH-MOBILE) {
    .info-wrapper {
      padding: 20px;
      background: $color-primary-100;

    }

    .info {
      padding: 16px;
      min-height: auto;
      border: 1px solid $color-primary-80;
      text-align: left;

      &-title {
        padding: 0;
        margin: 0;
      }
      &-text {
        padding: 16px 0;
        margin: 0;
      }
    }

    .about {
      margin: 32px 16px;

      &-divider {
        margin-top: 24px;
        border: none;
        border-top: 1.5px solid $color-primary-10;
      }

      &-numbers {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-start;
        margin: 24px 0 0 0;

        &-cell {
          border: 1.5px solid $color-primary-20;
          padding: 8px 0 0 0;
          text-align: center;
          width: 94px;
          height: 48px;
        }
      }
    }

    .tiles {
      margin-top: 24px;
      flex-direction: column;
      gap: 16px;

      .tile {
        padding: 20px;
      }
    }

    .articles {
      background-color: $color-grey-6;
      padding: 32px 0;
      &-wrapper {
        margin-left: 16px;
        margin-right: 16px;
      }
    }

    .sources {
      margin: 32px 16px;;
      .tile {
        padding: 0;
        &-white {
          margin: 0;
        }
      }
      .tile-white {
        margin: 0;
      }
    }
    .logos {
      display: block;
    }
    .go-to-search {
      transition: background-color 0.3s ease;
      background-color: $color-primary-100;
      padding: 24px 0;

      > div {
        flex-direction: column;
      }

      &-icon {
        transition: transform .3s ease-out;
        transform: scale(1.5);
      }

      &:hover, &:focus {
        outline: none;
        background-color: $color-black;

        .go-to-search-icon {
          transform: scale(1.5) translateX(12px);
        }
      }
    }
  }
</style>
