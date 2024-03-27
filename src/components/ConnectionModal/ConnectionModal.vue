<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'
import { getQrState, hideQrModal, polling } from '@/stores/qrCode'
import { getAuthorizationData, checkDataWalletConnection  } from '@/stores/authorization'
import Loader from '@/components/Loader/Loader.vue'
import Modal from '@/components/Modal/Modal.vue'
import Button from '@/components/Button/Button.vue'
import CloseIcon from '@/assets/icons/Exit.svg'

const { mdAndUp } = useDisplay()
const { t } = useI18n()
const qrCodeUrl = `${window.origin}/api/code`
const selectedTile = ref(0)
const loading = ref(false)
const snackbar = ref(false)

const commonTiles = [
  {
    title: computed(() => t('onboarding.tiles.favourites.title')),
    text: computed(() => t('onboarding.tiles.favourites.text')),
    img: '/img/onboarding/result.png',
    backgroundText: 'FAVOURITIES',
    styles: {
      left: '-20px',
      width: '548px',
    },
    mobileStyles: {
      left: '-10px',
      width: '360px',
    }
  },
  {
    title: computed(() => t('onboarding.tiles.share.title')),
    text: computed(() => t('onboarding.tiles.share.text')),
    img: '/img/onboarding/rating.png',
    backgroundText: 'EXPERICENCE',
    styles: {
      left: '-70px',
      width: '648px',
    },
    mobileStyles: {
      left: '-60px',
      width: '450px',
    }
  },
  {
    title: computed(() => t('onboarding.tiles.history.title')),
    text: computed(() => t('onboarding.tiles.history.text')),
    img: '/img/onboarding/engine.png',
    backgroundText: 'SEARCHHISTORY',
    styles: {
      left: '-70px',
      width: '648px',
    },
    mobileStyles: {
      left: '-70px',
      width: '648px',
    }
  }
]

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
    left: '-60px',
    width: '460px',
    top: '25px'
  },
  customButtons: [
    {
      variant: 'black',
      text: computed(() => t('onboarding.tiles.createWallet.button')),
      action: () => { hideQrModal() }
    }
  ]
}

const onBoarding2Tile = {
  title: computed(() => t('onboarding.tiles.scan.title')),
  text: computed(() => t('onboarding.tiles.scan.text')),
  img: qrCodeUrl,
  backgroundText: 'SCANCODE',
  styles: {
    left: '-80px',
    width: '600px',
  },
  mobileStyles: {
    left: '-60px',
    width: '460px',
    top: '25px'
  },
  customButtons: [
    {
      variant: 'white',
      text: computed(() => t('onboarding.tiles.scan.button1')),
      action: hideQrModal
    },
    {
      variant: 'black',
      text: computed(() => t('onboarding.tiles.scan.button2')),
      action: () => { hideQrModal(); polling() }
    }
  ]
}

const successTile = {
  title: computed(() => t('onboarding.tiles.success.title')),
  text: computed(() => `${t('onboarding.tiles.success.text')} <img src="/logoBlue.svg" alt="metasu" />`),
  img: '/img/onboarding/success.svg',
  backgroundText: 'SUCCESS',
  imgTileClass: 'success',
  styles: {
    left: '-80px',
    width: '620px',
  },
  mobileStyles: {
    top: '0px',
    left: '-50px',
    width: '420px',
  },
  customButtons: [
    {
      variant: 'black',
      text: computed(() => t('onboarding.tiles.success.button')),
      action: hideQrModal
    }
  ]
}

const errorTile = {
  title: computed(() => t('onboarding.tiles.error.title')),
  text: computed(() => t('onboarding.tiles.error.text')),
  img: '/img/onboarding/error.svg',
  backgroundText: 'SOME THING WENT WRONG',
  imgTileClass: 'error',
  styles: {
    left: '-80px',
    width: '660px',
  },
  mobileStyles: {
    top: '0px',
    left: '-50px',
    width: '420px',
  },
  customButtons: [{
    variant: 'black',
    text: computed(() => t('onboarding.tiles.error.button')),
    action: hideQrModal
  }]
}


const tiles = ref([])
watch(() => getQrState().showModal.value, async (show) => {
  if (show) {
    loading.value = true
    await checkDataWalletConnection()
    if(getQrState().error.value) {
      tiles.value = [errorTile]
      getQrState().error.value = false
    }
    else if (getAuthorizationData().hasDw.value === false) {
      tiles.value = [...commonTiles, onBoarding1Tile]
    } else if (getAuthorizationData().hasDwRelation.value === false) {
      tiles.value = [...commonTiles, onBoarding2Tile]
    } else if (getAuthorizationData().hasDwRelation.value === true) {
      tiles.value = [successTile]
    }
    selectedTile.value = 0
    loading.value = false
  }
})

watch(() => getQrState().isPolling.value, async (isPolling) => {
  if (isPolling) snackbar.value = true
})


</script>
<template>
  <v-snackbar
    v-model="snackbar"
    multi-line
    location="top"
    position="fixed"
    variant="flat"
    color="black"
    timeout="-1"
  >
    <div class="font-type-b5">
      {{ $t('onboarding.snackbar.text') }}
    </div>

    <template v-slot:actions>
      <Button
          @click="snackbar = false"
          :text="$t('onboarding.snackbar.button')"
          variant="white"
          compact
      />
    </template>
  </v-snackbar>
  <Modal
    :max-width="mdAndUp ? 1220 : 343"
    :fullscreen="false"
    v-model="getQrState().showModal.value"
    scrollable
  >
    <div v-if="loading" class="connection-dialog">
      <Loader/>
    </div>
    <div v-else class="connection-dialog d-flex flex-column flex-md-row">
      <div
        :class="tiles[selectedTile].imgTileClass || ''"
        class="connection-dialog-image d-flex justify-center align-center"
      >
        <div
          class="connection-dialog-image-text uppercase"
          :style="mdAndUp ? tiles[selectedTile].styles : tiles[selectedTile].mobileStyles"
        >
          {{ tiles[selectedTile].backgroundText }}
        </div>
        <img
          class="connection-dialog-image-small"
          :src="tiles[selectedTile].img"
        />
      </div>
      <div class="connection-dialog-container d-flex flex-column justify-space-between">
        <div class="d-none d-md-flex justify-end ">
          <button
            class="link"
            @click="hideQrModal"
            type="button"
          >
            <CloseIcon class="link black-icon" @click="() => showDialog = false" aria-hidden="true"/>
            <span class="sr-only">{{ $t('modal.close') }}</span>
          </button>
        </div>
        <div class="connection-dialog-container-text color-black">
          <div class="header-md-2 header-sm-1 text-center mb-md-10 mb-4">
            {{ tiles[selectedTile].title }}
          </div>
          <div
            class="header-md-8 header-sm-7 text-center"
            v-html="tiles[selectedTile].text"
          >
          </div>
        </div>
        <div class="connection-dialog-container-buttons d-flex flex-column align-center">
          <div
            v-if="tiles.length > 1"
            class="text-black d-flex"
          >
            <button v-for="(e, index) in tiles"
              :key="index"
              class="tile link"
              :class="{ active: selectedTile === index }"
              @click="selectedTile=index"
              ><div class="tile-inside"/>
            </button>
          </div>
          <div
            :class="tiles[selectedTile].imgTileClass || ''"
            class="buttons d-flex mt-md-8 mt-6"
          >
            <template v-if="tiles[selectedTile].customButtons && tiles[selectedTile].customButtons.length">
              <Button
                v-for="(btn, index) in tiles[selectedTile].customButtons"
                :key="index"
                class="button"
                :variant="btn.variant"
                @click="btn.action"
              >
                {{ btn.text }}
              </Button>
            </template>
            <template v-else>
              <Button
                class="button"
                @click="hideQrModal"
              >
                {{ $t("onboarding.carusel.later") }}
              </Button>
              <Button
                v-if="tiles.length > 1"
                class="button"
                variant="black"
                @click="selectedTile < tiles.length -1 ? selectedTile += 1 : selectedTile = 0"
              >
                {{ $t("onboarding.carusel.next") }}
              </Button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<style lang="scss" scoped>
.connection-dialog {
  background-color: #FFF;
  align-items: stretch;
  overflow-y: auto;
  min-width: 300px;
  min-height: 400px;

  &-image {
    position: relative;
    overflow: hidden;
    background-color: $color-primary-5;
    min-height: 638px;
    flex-basis: 508px;
    flex-shrink: 0;

    &.success {
      background-color: $color-success;
      .connection-dialog-image-text {
        color: #FFF
      }
    }
    &.error {
      background-color: $color-error;
      .connection-dialog-image-text {
        word-break: normal;
        color: #FFF
      }
    }
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

      &-buttons {
        margin: 24px 24px 0 24px;

        .buttons {
          width: 294px;
          gap: 8px;

          &.success, &.error{
            width: auto;
          }
          .button {
            min-width: 140px;
            width: 143px;
          }
        }
      }
    }
  }
}

</style>