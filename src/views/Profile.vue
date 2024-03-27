<script setup>
import { useI18n } from 'vue-i18n'
import { computed, ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { getAuthorizationData } from '@/stores/authorization'
import { polling } from '@/stores/qrCode'
import Favourites from '@/components/Profile/Favourites.vue'
import Reviews from '@/components/Profile/Reviews.vue'
import Settings from '@/components/Profile/Settings.vue'
import Button from '@/components/Button/Button.vue'
import Tabs from '@/components/Tabs/Tabs.vue'

const props = defineProps({
  tab: { type: String }
})

const router = useRouter()
const { t } = useI18n()
const { mdAndUp } = useDisplay()
const tabRef = ref()

const tabs = computed(() => {
  return [
    { name: t('profile.tabs.settings'), key: 'settings' },
    { name: t('profile.tabs.favorites'), key: 'favorites' },
    { name: t('profile.tabs.reviews'), key: 'reviews' }
  ]
})

const onTabChange = (tab) => {
  router.replace({ params: {tab: tab.key }})
}

const onBoarding1Tile = {
  title: computed(() => t('onboarding.tiles.createWallet.title')),
  text: computed(() => t('onboarding.tiles.createWallet.text')),
  img: '/img/companies/mb.svg',
  backgroundText: 'CREATEWALLET',
  styles: {
    left: '-80px',
    width: '650px',
  },
  mobileStyles: {
    left: 'auto',
    right: 'auto',
    width: '460px',
    top: '25px'
  },
}

const onBoarding2Tile = {
  title: computed(() => t('onboarding.tiles.scan.title')),
  text: computed(() => t('onboarding.tiles.scan.text')),
  img: `${window.origin}/api/code`,
  backgroundText: 'SCANCODE',
  styles: {
    left: '-80px',
    width: '600px',
  },
  mobileStyles: {
    left: 'auto',
    right: 'auto',
    width: '460px',
    top: '25px'
  }
}

const onboardingTile = ref(onBoarding1Tile)

onMounted(() => {
  if (!getAuthorizationData().authorized.value) {
    return router.push('/')
  }

  if(getAuthorizationData().hasDwRelation.value) {
    switch(props.tab) {
    case 'favorites':
      tabRef.value.changeTab(tabs.value[1])
      break
    case 'reviews':
      tabRef.value.changeTab(tabs.value[2])
      break
    case 'settings':
    default:
      tabRef.value.changeTab(tabs.value[0])
    }
  } else {
    if (!getAuthorizationData().hasDw.value) {
      onboardingTile.value = onBoarding1Tile
    } else {
      onboardingTile.value = onBoarding2Tile
    }
  }
})

watch(() => props.tab, () => {
  if(getAuthorizationData().hasDwRelation.value) {
    switch(props.tab) {
    case 'favorites':
      tabRef.value.changeTab(tabs.value[1])
      break
    case 'reviews':
      tabRef.value.changeTab(tabs.value[2])
      break
    case 'settings':
    default:
      tabRef.value.changeTab(tabs.value[0])
    }
  }
})

</script>
<template>
  <div class="limited-width pl-0 pr-0 pt-0 pl-md-12 pr-md-12 pt-md-12 w-100 color-black">
    <div class="header-6 pb-12 d-none d-md-block">{{ $t('profile.header') }}</div>
    <Tabs
      v-if="getAuthorizationData().hasDwRelation.value"
      :tabs="tabs"
      ref="tabRef"
      @tab:change="onTabChange"
      :mb="mdAndUp ? 'mb-12' : 'mb-4'"
    >
      <template #settings>
        <Settings></Settings>
      </template>
      <template #favorites>
        <Favourites></Favourites>
      </template>
      <template #reviews>
        <Reviews></Reviews>
      </template>
    </Tabs>
    <div v-else>
      <div class="connection-info d-flex flex-column flex-md-row">
        <div
          class="connection-info-image d-flex justify-center align-center"
        >
          <div
            class="connection-info-image-text uppercase"
            :style="mdAndUp ? onboardingTile.styles : onboardingTile.mobileStyles"
          >
            {{ onboardingTile.backgroundText }}
          </div>
          <img
            class="connection-info-image-small"
            :src="onboardingTile.img"
          />
        </div>
        <div class="connection-info-container d-flex flex-column justify-center">
          <div class="connection-info-container-text color-black">
            <div class="header-md-2 header-sm-1 text-center mb-md-10 mb-4">
              {{ onboardingTile.title }}
            </div>
            <div
              class="header-md-8 header-sm-7 text-center"
              v-html="onboardingTile.text"
            >
            </div>
          </div>
          <div class="connection-info-container-buttons d-flex flex-column align-center">
            <div
              v-if="getAuthorizationData().hasDw.value"
              class="buttons d-flex mt-md-8 mt-6"
            >
              <Button
                class="button"
                variant="black"
                @click="polling"
              >
                {{ $t('onboarding.tiles.scan.button2') }}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.connection-info {
  background-color: #FFF;
  align-items: stretch;
  overflow-y: auto;
  min-width: 300px;
  min-height: 400px;
  margin-bottom: 48px;

  &-image {
    position: relative;
    overflow: hidden;
    background-color: $color-primary-5;
    min-height: 638px;
    flex-basis: 508px;
    flex-shrink: 0;

    &-text {
      pointer-events: none;
      color: $color-black;
      position: absolute;
      word-break: break-all;
      left:  -20px;
      width: 548px;
      text-align: center;
      font-family: 'Manrope';
      font-size: 216px;
      font-style: normal;
      font-weight: 800;
      line-height: 168px;
      opacity: 0.05;
      text-wrap: wrap;
    }
    &-small {
      z-index: 2;
    }
  }

  &-container {
    padding: 24px 24px 48px 24px;
    flex-basis: 713px;
    flex-shrink: 1;
    flex-grow: 1;

    &-text {
      b {
        font-weight: 600;
      }
    }

    &-buttons {
      align-self: center;
      .buttons {
        align-self: center;
        gap: 24px;
      }


      .tile {
        width: 32px;
        height: 32px;
        min-width: 32px;
        min-height: 32px;
        background-color: #FFF;
        padding: 11px;

        &-inside {
          background-color: $color-primary-30;
          width: 100%;
          height: 100%;
        }

        &.active {
          padding: 8px;
          transition: all 0.2s ease;
          .tile-inside {
            background-color: $color-primary-100;
          }
        }
      }
    }
  }

  @media (max-width: $MAX-WIDTH-MOBILE) {
    margin-bottom: 0;

    &-image {
      min-height: 194px;
      flex: 343px 0 0;

      &-text {
        top: -35px;
        font-size: 144px;
        font-weight: 800;
        line-height: 120px;
      }
      &-small {
        width: 264px;
      }
    }

    &-container {
      padding-bottom: 24px;
      flex-basis: auto;

      &-buttons {
        margin: 24px 24px 0 24px;

        .buttons {
          .button {
            min-width: 140px;
          }
        }
      }
    }
  }
}
</style>