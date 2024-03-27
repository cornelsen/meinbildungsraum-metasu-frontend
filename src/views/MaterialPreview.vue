<script setup>
import { useI18n } from 'vue-i18n'
import { ref, computed, watch } from 'vue'
import { service } from '@/helpers/api'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import Tabs from '@/components/Tabs/Tabs.vue'
import Rating from '@/components/Rating/RatingComments.vue'
import RatingPreview from '@/components/Rating/RatingPreview.vue'
import VotingDialog from '@/components/Rating/VotingDialog.vue'
import { RawMediaTypes } from '@/enums/mediatypes'
import Button from '@/components/Button/Button.vue'
import TypeRightIcon from '@/assets/icons/Type=Right.svg'
import ShareIcon from '@/assets/icons/Share.svg'
import HatIcon from '@/assets/icons/Type=Hat.svg'
import GroupIcon from '@/assets/icons/Type=Gropu.svg'
import CopyrightIcon from '@/assets/icons/Copyright.svg'
import VideoIcon from '@/assets/icons/Big=No, Black=Yes, Type=Video, Focused=No.svg'
import AudioIcon from '@/assets/icons/Big=No, Black=Yes, Type=Audio, Focused=No.svg'
import ImageIcon from '@/assets/icons/Big=No, Black=Yes, Type=Photos, Focused=No.svg'
import DocumentIcon from '@/assets/icons/Big=No, Black=Yes, Type=Document, Focused=No.svg'
import InteractiveIcon from '@/assets/icons/Big=No, Black=Yes, Type=Interactive, Focused=No.svg'
import { mapRawResult, getPublisherById } from '@/components/Search/commons/Search.helper'
import { getAuthorizationData  } from '@/stores/authorization'
import { getQrState, showQrModal } from '@/stores/qrCode'
import MaterialPreviewCarusel from '@/components/MaterialPreview/MaterialPreviewCarusel.vue'
import TocItem from '@/components/MaterialPreview/TocItem.vue'
import LastViewedCarusel from  '@/components/LastViewedCarusel/LastViewedCarusel.vue'
import Loader from '@/components/Loader/Loader.vue'
import { addMaterialAsLastViewed } from '@/stores/lastVisited'
import ArrowRightIcon from '@/assets/icons/Side=Right.svg'
import HistoryCrumb from '@/components/HistoryCrumb/HistoryCrumb.vue'

const props = defineProps({
  publisherId: { type: String },
  materialId: { type: String }
})
const router = useRouter()
const { mdAndUp } = useDisplay()
const tocList = ref([])
const loader = ref(false)
const error = ref(false)
const votingDialogOpen = ref(false)
const ratingOpen = ref(false)
const allVotes = ref(0)
const rated = ref(false)
const favourite = ref(false)
const favSnackbar = ref(false)
const rating = ref('0.0')
const materialPreview = ref()

const publisher = getPublisherById(props.publisherId)

if (!publisher) {
  router.push('/')
}


const fetchDetails = async () => {
  loader.value = true
  error.value = false
  try {
    const { data } = await service.get(`/search/details/${props.publisherId}/${props.materialId}`)
    materialPreview.value = mapRawResult(data)
    tocList.value = data.toc || []
    allVotes.value = data.totalRatingsCount
    rated.value = data.rated
    rating.value = data.currentRating
    favourite.value = data.favorite
    addMaterialAsLastViewed(materialPreview.value)
  } catch(e) {
    console.log('error: %o', e)
    if (e.response.status === 404) {
      router.push('/')
    }
    error.value = true
  }
  loader.value = false
}

const tabComp = ref(null)
const { t } = useI18n()

const tabs = computed(() => {
  return [
    { name: t('matPreview.description.tab'), key: 'description' },
    ...props.materialId ? [{ name: t('matPreview.preview.tab'), key: 'preview'} ]: [],
    { name: t('matPreview.details.tab'), key: 'details' }
  ]
})

watch([() => props.publisherId, () => props.materialId ], () => {
  tabComp.value.changeTab(tabs.value[0])
  favSnackbar.value = false
  fetchDetails()
})

fetchDetails()

const getBackgroundImage = () => {
  if (materialPreview.value.image) return materialPreview.value.image
  switch (materialPreview.value.type) {
  case RawMediaTypes.MEDIA_IMAGES_VISUALS:
    return '/PlaceholderPhoto.svg'
  case RawMediaTypes.MEDIA_VIDEO:
    return '/PlaceholderVideo.svg'
  case RawMediaTypes.MEDIA_AUDIO:
    return '/PlaceholderAudio.svg'
  case RawMediaTypes.INTERACTIVE_ANIMATION:
  case RawMediaTypes.INTERACTIVE_SIMULATION:
  case RawMediaTypes.INTERACTIVE_WHITEBOARD:
    return '/PlaceholdeInteractive.svg'
  default:
    return '/PlaceholderDocument.svg'
  }
}

const getComponentByType = () => {
  switch (materialPreview.value.type) {
  case RawMediaTypes.MEDIA_IMAGES_VISUALS:
    return ImageIcon
  case RawMediaTypes.MEDIA_VIDEO:
    return VideoIcon
  case RawMediaTypes.MEDIA_AUDIO:
    return AudioIcon
  case RawMediaTypes.INTERACTIVE_ANIMATION:
  case RawMediaTypes.INTERACTIVE_SIMULATION:
  case RawMediaTypes.INTERACTIVE_WHITEBOARD:
    return InteractiveIcon
  case RawMediaTypes.TEXT_BOOK:
  case RawMediaTypes.TEXT_CHAPTER:
  case RawMediaTypes.TEXT_DOCUMENT:
  case RawMediaTypes.TEXT_PASSAGE:
  case RawMediaTypes.TEXT_REFERENCE:
  case RawMediaTypes.TEXT_WEBSITE:
    return DocumentIcon
  default:
    return null
  }
}

const handleFavourites = async () => {
  if(getQrState().display.value) {
    showQrModal()
    return
  }
  if (favourite.value) {
    try {
      await service.post('/favorites/unmark',
        {
          id: props.materialId,
          publisherId: props.publisherId
        }
      )
      favourite.value = false
      favSnackbar.value = true
    } catch (e) {
      console.log('error: %o', e)
    }
  } else {
    try {
      await service.post('/favorites/mark',
        {
          id: props.materialId,
          publisherId: props.publisherId
        }
      )
      favourite.value = true
      favSnackbar.value = true
    } catch (e) {
      console.log('error: %o', e)
    }
  }
}
const openMaterialUrl = () => {
  window.open(materialPreview.value.materialUrl, '_blank')
}

</script>

<template>
  <v-snackbar
    v-model="error" multi-line
    location="top"
    position="fixed"
    variant="flat"
    color="#D4323C"
    timeout="-1"
  >
    <div class="font-type-b5">
      {{ $t('errors.engine') }}
    </div>

    <template v-slot:actions>
      <Button
        @click="fetchDetails"
        :text="$t('errors.refresh')"
        variant="black"
        compact
      />
    </template>
  </v-snackbar>
  <v-snackbar
      v-model="favSnackbar" multi-line
      location="top"
      position="fixed"
      variant="flat"
      color="#2A823D"
      timeout="5000"
    >
    <div class="font-type-b5">
      {{ $t(`matPreview.favourites.${favourite ? 'added' : 'removed'}`) }}
    </div>
  </v-snackbar>
  <VotingDialog
    v-if="materialPreview"
    :title="materialPreview.title"
    :id="materialPreview.id"
    :publisherId="publisherId"
    v-model:open="votingDialogOpen"
    @rated="() => fetchDetails()"
  />
  <Rating
    v-if="materialPreview"
    :title="materialPreview.title"
    :publisherId="publisherId"
    :materialId="materialId"
    v-model:open="ratingOpen"
  />
  <div class="limited-width pl-4 pr-4 pl-md-12 pr-md-12 w-100">
    <HistoryCrumb />
    <Loader v-if="loader"/>
    <div v-if="materialPreview">
      <Tabs
        :tabs="tabs"
        class="mt-8 mt-md-12"
        ref="tabComp"
        :mb="mdAndUp ? 'mb-12' : 'mb-8'"
      >
        <template #description>
          <div class="description">
            <div class="mb-8 mb-md-12 d-md-flex d-block">
              <div class="description-image">
                <div v-if="getComponentByType()" class="description-type">
                  <component
                    :is="getComponentByType()"
                    :height="mdAndUp ? 56 : 32"
                    :width="mdAndUp ? 56 : 32"
                  />
                </div>
                <button
                  v-if="getAuthorizationData().authorized.value"
                  @click.prevent="() => handleFavourites()"
                  class="description-favourite link"
                  :class="{ 'favourite': favourite }"
                >
                  <span class="sr-only">
                    {{
                      favourite
                      ? $t('matPreview.srOnly.removeFavorite')
                      : $t('matPreview.srOnly.addFavorite')
                    }}
                  </span>
                </button>
                <div
                  class="description-image-background"
                  :style="{background: `linear-gradient(0deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)),  url(${getBackgroundImage()}) 0 0/100% 100%`}"></div>
                <img :src="getBackgroundImage()" :alt="materialPreview.title"/>
              </div>
              <div class="ml-0 ml-md-16 mt-12 mt-md-10 flex flex-column">
                <div class="header-md-6 header-sm-5">
                  {{  materialPreview.title }}
                </div>
                <div class="header-md-7 font-type-sm-b2 mt-2 mb-5">
                  {{  $t('matPreview.description.publisher') }}:
                  <span class="font-type-sm-b1 header-md-8">{{ materialPreview.publisher.title }}</span>
                </div>
                <RatingPreview
                  :rating="rating"
                  :rated="rated"
                  :allVotes="allVotes"
                  @openRating="ratingOpen = true"
                  @openVoteModal="getQrState().display.value ? showQrModal() : votingDialogOpen = true"

                />

                <div class="description-buttons flex flex-wrap flex-column flex-md-row">
                  <Button
                    variant="white"
                    :text="!mdAndUp ? $t('matPreview.description.shareMaterial') : undefined"
                    :iconRight="!mdAndUp ? ShareIcon : undefined"
                  >
                    <span class="d-none d-md-flex">
                      {{ $t('matPreview.description.shareMaterial') }}
                      <ShareIcon aria-hidden="true" class="black-icon ml-2"/>
                    </span>
                  </Button>
                  <Button
                    variant="black"
                    @click="openMaterialUrl"
                    :text="!mdAndUp ? $t('matPreview.description.goToPublisher') : undefined"
                    :iconRight="!mdAndUp ? TypeRightIcon : undefined"
                  >
                    <span class="d-none d-md-flex">
                      <div>{{ $t('matPreview.description.goToPublisher') }}</div>
                      <TypeRightIcon aria-hidden="true" class="white-icon ml-2"/>
                    </span>
                  </Button>
                </div>
                <div v-if="materialPreview.type" class="font-type-md-b5 font-type-sm-b4 mb-2">
                  {{ t('matPreview.mediaType') }}: {{ t(`search.mediaTypes.${materialPreview.type}`) }}
                </div>
                <div class="font-type-md-b5 font-type-sm-b4">
                  {{ materialPreview.description }}
                </div>
                <div class="description-icons flex font-type-b5 color-grey-1">
                    <div class="flex description-icons-icon">
                      <HatIcon class="flex-shrink-0 black-icon"/>
                      <span class="ml-2 mb-2 d-inline-block header-sm-7">
                        <template v-for="(subject, index) in materialPreview.subjects">
                          {{ $t(`search.subjects.${subject}`) }}{{ index < materialPreview.subjects.length - 1 ? ', ' : ''}}
                        </template>
                      </span>
                    </div>
                    <div class="flex ml-0 ml-md-15 description-icons-icon">
                      <GroupIcon class="flex-shrink-0 black-icon"/>
                      <span class="ml-2 mb-2 d-inline-block header-sm-7">{{ materialPreview.age }}</span>
                    </div>
                </div>
                <div class="mt-8 flex flex-grow-1">
                  <CopyrightIcon class="align-self-end"/>
                  <div class="font-type-md-b5 header-sm-7 color-grey-4 ml-2 align-self-end">{{ materialPreview.publisher.title }}</div>
                </div>
              </div>
            </div>
            <router-link
              :to="`/publisher/${publisherId}`"
              class="go-to-publisher color-black link"
            >
              <div class="header-md-5 header-sm-3">
                {{ materialPreview.publisher.title }}
              </div>
              <div class="separator"></div>
              <div class="mb-2 font-md-button font-sm-button">
                {{  $t('matPreview.description.goToPublisher') }}
                <ArrowRightIcon
                  :height="mdAndUp ? 32 : 24"
                  :width="mdAndUp ? 32 : 24"
                  icon="left"
                  class="black-icon publisher-arrow"
                  aria-hidden="true"
                />
              </div>
            </router-link>
          </div>
        </template>
        <template #preview>
          <div
            v-if="materialPreview.productId && tocList.length"
            class="preview flex-column flex-md-row">
            <div class="preview-menu">
              <h2 class="header-md-8 header-sm-5">{{ $t('matPreview.preview.avFreeContent') }}</h2>
              <div class="preview-menu-content">
                <div class="preview-menu-content-item font-type-b2">
                  {{ $t('matPreview.preview.modules') }}
                  ({{ tocList.length }})</div>
              </div>
              <div class="preview-menu-bottom">
                <div class="preview-menu-bottom-hint font-type-b5">
                  <div>
                    {{ $t('matPreview.preview.hintLine1') }}<br>
                    {{ $t('matPreview.preview.hintLine2') }}
                  </div>
                  <Button
                    class="mt-4"
                    variant="black"
                    @click="openMaterialUrl"
                    :text="$t('matPreview.description.goToPublisher')"
                    :iconRight="TypeRightIcon"
                  ></Button>
                </div>
              </div>
            </div>
            <div class="preview-content">
              <h2 class="header-md-8 header-sm-5">
                {{ $t('matPreview.preview.structure') }}
              </h2>
              <div class="d-none d-md-block header-6 mt-6">
                {{ materialPreview.title }}
              </div>
              <div class="preview-content-hint font-type-sm-b2 font-type-md-b1 mt-2 mt-md-10 mb-6 mb-md-10">
                  {{ $t('matPreview.preview.avPreviewsForBook') }}
              </div>
              <div class="preview-content-background">
                <TocItem v-for="(child, index) in tocList"
                  :toc="child"
                  :key="index"
                  @expand:current="() => {}"
                />
              </div>
            </div>
          </div>
        </template>
        <template #details>
          <div>&nbsp;</div>
        </template>
      </Tabs>

      <LastViewedCarusel
        :materialToIgnore="materialPreview"
      />
      <MaterialPreviewCarusel
        class="mt-80 mb-8 mt-md-160 mb-md-80"
        :subjects="materialPreview.subjects"
      />

    </div>
  </div>
</template>

<style lang="scss" scoped>
.description {
  margin-bottom: 336px;

  &-image {
    flex-shrink: 0;
    overflow: hidden;
    height: 600px;
    width: 680px;
    position: relative;

    &-background {
      filter: blur(15px);
      position: relative;
      height: 150%;
      width: 150%;
      top: -25%;
      left: -25%;
    }

    img {
      position: absolute;
      z-index: 1;
      max-width: 100%;
      max-height: 100%;
      top: 50%;
      left: 50%;
      height: 472px;
      transform: translateY(-50%) translateX(-50%);
    }
  }
  &-favourite {
    position: absolute;
    left: 32px;
    top: 32px;
    z-index: 2;
    width: 40px;
    height: 40px;
    background-image: url('/img/Heart-Off.svg');

    &:hover {
      background-image: url('/img/Heart-On.svg');
    }
    &.favourite {
      background-image: url('/img/Heart-On.svg');
    }
  }
  &-type {
    position: absolute;
    bottom: 32px;
    right: 32px;
    z-index: 2;
  }
  &-buttons {
    margin-top: 30px;
    margin-bottom: 50px;
    gap: 48px;
  }
  &-icons {
    margin-top: 50px;
  }
}
.preview {
  display: flex;
  gap: 48px;
  margin-bottom: 48px;

  &-menu {
    padding: 48px;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    position: sticky;
    top: 0;
    align-self: flex-start;
    width: 485px;
    height: 100vh;
    background-color: $color-grey-6;

    &-content {
      margin-top: 68px;

      &-item {
        display: inline-block;
        border-bottom: 1px solid $color-black;
      }
    }
    &-bottom {
      align-items: flex-end;
      display: flex;
      flex-grow: 1;

      &-hint {
        color: $color-grey-3;
      }
    }
  }
  &-content {
    flex-grow: 1;
    background-color: $color-grey-6;
    padding: 48px;

    &-hint {
      color: $color-grey-3;
    }
    &-background {
      padding: 48px;
      background-color: #FFF;
    }
  }
}
.go-to-publisher {
  outline: none;
  position: absolute;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 80px;
  padding-bottom: 80px;
  background-color: $color-grey-6;

  .separator {
    display: flex;
    align-self: center;
    height: 34px;
    border-right: 1.5px solid $color-grey-5;
    margin-left: 24px;
    margin-right: 24px;
  }

  .publisher-arrow {
    position: relative;
    bottom: -10px;
    transition: transform .3s ease-out;
  }

  &:hover .publisher-arrow, &:focus .publisher-arrow {
    transform: translateX(12px);
  }
}

@media (max-width: $MAX-WIDTH-MOBILE) {
  .description {
    margin-bottom: 220px;
    &-image {
      height: 300px;
      width: 343px;

      img {
        width: auto;
        height: 80%;
      }
    }
    &-favourite {
      left: 16px;
      top: 16px;
      width: 32px;
      height: 32px;
      background-size: 32px;
    }
    &-type {
      bottom: 16px;
      right: 16px;
    }
    &-buttons {
      margin-bottom: 24px;
      gap: 16px;
    }
    &-icons {
      margin-top: 24px;

      &-icon {
        flex: 0 0 50%;
      }
    }
  }

  .go-to-publisher {
    padding: 48px 16px;

    .publisher-arrow {
      position: relative;
      bottom: -8px;
      transition: transform .3s ease-out;
    }
  }
  .preview {
    margin-bottom: 48px;
    gap: 8px;
    background-color: $color-grey-6;

    &-menu {
      padding: 16px;
      position: static;
      width: 100%;
      height: auto;

      &-content {
        margin-top: 24px;
      }
      &-bottom {
        display: none;
      }
    }
    &-content {
      padding: 16px;

      &-background {
        padding: 16px;
      }
    }
  }
}
</style>
