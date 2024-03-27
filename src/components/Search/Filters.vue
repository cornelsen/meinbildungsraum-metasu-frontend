<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'
import Button from '@/components/Button/Button.vue'
import InputButton from '@/components/Button/InputButton.vue'
import Select from '@/components/Forms/Select.vue'
import Modal from '@/components/Modal/Modal.vue'
import Tag from '@/components/Tag/Tag.vue'

import ActiveNoIcon from '@/assets/icons/Active=No.svg'
import ActiveYesIcon from '@/assets/icons/Active=Yes.svg'
import ActiveYesMobileIcon from '@/assets/icons/Active=Yes=Mobile.svg'
import ArrowLeftIcon from '@/assets/icons/Side=Left.svg'
import ArrowDownIcon from '@/assets/icons/ArrowDownSmall.svg'
import ArrowUpIcon from '@/assets/icons/ArrowUpSmall.svg'
import SortIcon from '@/assets/icons/Sort.svg'
import CloseIcon from '@/assets/icons/Exit.svg'
import TypeRightIcon from '@/assets/icons/Type=Right.svg'

import BubbleAllEN from '@/assets/icons/bubbles/all.svg'
import BubbleAllDE from '@/assets/icons/bubbles/all-de.svg'
import BubblePhoto from '@/assets/icons/bubbles/photo.svg'
import BubbleVideo from '@/assets/icons/bubbles/video.svg'
import BubbleDocument from '@/assets/icons/bubbles/document.svg'
import BubbleAudio from '@/assets/icons/bubbles/audio.svg'
import BubbleInteractive from '@/assets/icons/bubbles/interactive.svg'

import BubbleAllENMobile from '@/assets/icons/bubbles/allMobile.svg'
import BubbleAllDEMobile from '@/assets/icons/bubbles/all-deMobile.svg'
import BubblePhotoMobile from '@/assets/icons/bubbles/photoMobile.svg'
import BubbleVideoMobile from '@/assets/icons/bubbles/videoMobile.svg'
import BubbleDocumentMobile from '@/assets/icons/bubbles/documentMobile.svg'
import BubbleAudioMobile from '@/assets/icons/bubbles/audioMobile.svg'
import BubbleInteractiveMobile from '@/assets/icons/bubbles/interactiveMobile.svg'

import MediaTypes, { RawMediaTypes } from '@/enums/mediatypes'

const emit = defineEmits(['filterSearch'])

const props = defineProps({
  formItems: {},
  pFormData: {}, // initial search data
  isPublisher: {type: Boolean, default: false },
  searchStore: {type: Object}
})

const { t, locale } = useI18n()
const { mdAndUp } = useDisplay()

const expandedFilters = ref(false)
const disabledPageChangeWatcher = ref(false)
const disabledSortChangeWatcher = ref(false)
const formItems = reactive(props.formItems)
const formData = props.searchStore.getFilterState() // displayed data in form
const sortByModalShow = ref(false)
const filterModalState = ref('')
const appliedFilters = reactive({
  schoolType: [...formData.schoolType],
  studyYear: [...formData.studyYear],
  publisher: [...formData.publisher],
  federalState: [...formData.federalState],
  grade: [...formData.grade],
  differentiation: [...formData.differentiation],
  schoolBook: [...formData.schoolBook],
  sortType: ['publishDate-desc']
})


const mapMediaTypesToBubbles = (mTypes) => {
  const arr = []
  if (
    mTypes.includes(RawMediaTypes.INTERACTIVE_ANIMATION) &&
    mTypes.includes(RawMediaTypes.INTERACTIVE_SIMULATION) &&
    mTypes.includes(RawMediaTypes.INTERACTIVE_WHITEBOARD)
  ) arr.push(MediaTypes.INTERACTIVE)

  if (
    mTypes.includes(RawMediaTypes.TEXT_BOOK) &&
    mTypes.includes(RawMediaTypes.TEXT_CHAPTER) &&
    mTypes.includes(RawMediaTypes.TEXT_DOCUMENT) &&
    mTypes.includes(RawMediaTypes.TEXT_PASSAGE) &&
    mTypes.includes(RawMediaTypes.TEXT_REFERENCE) &&
    mTypes.includes(RawMediaTypes.TEXT_WEBSITE)
  ) arr.push(MediaTypes.DOCUMENT)

  if (
    mTypes.includes(RawMediaTypes.MEDIA_AUDIO)
  ) arr.push(MediaTypes.AUDIO)

  if (
    mTypes.includes(RawMediaTypes.MEDIA_IMAGES_VISUALS)
  ) arr.push(MediaTypes.IMAGE)

  if (
    mTypes.includes(RawMediaTypes.MEDIA_VIDEO)
  ) arr.push(MediaTypes.VIDEO)

  return arr
}

const mapBubblesToMediaTypes = () => {
  if (bubbleFilters.value.length === 5) return []

  const arr = []
  if (bubbleFilters.value.includes(MediaTypes.INTERACTIVE))
    arr.push(
      RawMediaTypes.INTERACTIVE_ANIMATION,
      RawMediaTypes.INTERACTIVE_SIMULATION,
      RawMediaTypes.INTERACTIVE_WHITEBOARD
    )

  if (bubbleFilters.value.includes(MediaTypes.DOCUMENT))
    arr.push(
      RawMediaTypes.TEXT_BOOK,
      RawMediaTypes.TEXT_CHAPTER,
      RawMediaTypes.TEXT_DOCUMENT,
      RawMediaTypes.TEXT_PASSAGE,
      RawMediaTypes.TEXT_REFERENCE,
      RawMediaTypes.TEXT_WEBSITE
    )

  if (bubbleFilters.value.includes(MediaTypes.AUDIO))
    arr.push(
      RawMediaTypes.MEDIA_AUDIO
    )

  if (bubbleFilters.value.includes(MediaTypes.IMAGE))
    arr.push(
      RawMediaTypes.MEDIA_IMAGES_VISUALS
    )

  if (bubbleFilters.value.includes(MediaTypes.VIDEO))
    arr.push(
      RawMediaTypes.MEDIA_VIDEO
    )

  return [... new Set(mediaTypesCpy.concat(arr))]
}

const bubbleFilters = ref([])
let mediaTypesCpy = []

const sortBy = computed(() => ([
  { key: 'name-asc', label: t('search.filters.sortTypes.alphabetic') },
  { key: 'relevance-desc', label: t('search.filters.sortTypes.mostViewed') },
  { key: 'publishDate-desc', label: t('search.filters.sortTypes.newest') },
  { key: 'publishDate-asc', label: t('search.filters.sortTypes.oldest') }
]))

const BubbleAll = computed (() => locale.value === 'de' ? BubbleAllDE : BubbleAllEN)
const BubbleAllMobile = computed (() => locale.value === 'de' ? BubbleAllDEMobile : BubbleAllENMobile)
const bubbles = computed(() => {
  return [
    {
      component: BubbleDocument,
      componentMobile: BubbleDocumentMobile,
      label: t('search.bubbles.document'), mediaType: MediaTypes.DOCUMENT
    },
    {
      component: BubblePhoto,
      componentMobile: BubblePhotoMobile,
      label: t('search.bubbles.image'), mediaType: MediaTypes.IMAGE
    },
    {
      component: BubbleAudio,
      componentMobile: BubbleAudioMobile,
      label: t('search.bubbles.audio'), mediaType: MediaTypes.AUDIO
    },
    {
      component: BubbleVideo,
      componentMobile: BubbleVideoMobile,
      label: t('search.bubbles.video'), mediaType: MediaTypes.VIDEO
    },
    {
      component: BubbleInteractive,
      componentMobile: BubbleInteractiveMobile,
      label: t('search.bubbles.interactive'), mediaType: MediaTypes.INTERACTIVE
    }
  ]
})
watch(() => props.pFormData.schoolType, () => {
  appliedFilters.schoolType = [...formData.schoolType]
})
watch(() => props.pFormData.studyYear, () => {
  appliedFilters.studyYear = [...formData.studyYear]
})
watch(() => props.pFormData.publisher, () => {
  appliedFilters.publisher = [...formData.publisher]
})
watch(() => props.pFormData.federalState, () => {
  appliedFilters.federalState = [...formData.federalState]
})
watch(() => props.pFormData.grade, () => {
  appliedFilters.grade = [...formData.grade]
})
watch(() => props.pFormData.differentiation, () => {
  appliedFilters.differentiation = [...formData.differentiation]
})
watch(() => props.pFormData.schoolBook, () => {
  appliedFilters.schoolBook = [...formData.schoolBook]
})
watch(() => props.pFormData.mediaType, () => {
  mediaTypesCpy = props.pFormData.mediaType
  bubbleFilters.value = (mapMediaTypesToBubbles(props.pFormData.mediaType))
})
watch(() => props.pFormData.sortType, () => {
  disabledSortChangeWatcher.value = true
  appliedFilters.sortType = [...formData.sortType]
  nextTick(() => {
    disabledSortChangeWatcher.value = false
  })
})

const doSearchByFilter = async () => {
  emit('filterSearch', Object.assign({},
    appliedFilters,
    formData,
    { mediaType: mapBubblesToMediaTypes() },
    { sortType: appliedFilters.sortType })
  )
  appliedFilters.schoolType = [...formData.schoolType]
  appliedFilters.studyYear = [...formData.studyYear]
  appliedFilters.publisher = [...formData.publisher]
  appliedFilters.federalState = [...formData.federalState]
  appliedFilters.grade = [...formData.grade]
  appliedFilters.differentiation = [...formData.differentiation]
  appliedFilters.schoolBook = [...formData.schoolBook]
}

const setPageToFirst = () => {
  disabledPageChangeWatcher.value = true
  formData.page = 1
  nextTick(() => {
    disabledPageChangeWatcher.value = false
  })
}

const removeFromBubbleCpy = (type) => {
  let elIndex = mediaTypesCpy.indexOf(type)
  if (elIndex > -1) mediaTypesCpy.splice(elIndex, 1)
  return
}

const toggleFilter = (element) => {
  setPageToFirst()
  // from 4 to ALL
  if(Array.isArray(element)) {
    if (bubbleFilters.value.length === 5) {
      formData.mediaType = []
    } else {
      bubbleFilters.value = element
    }
    doSearchByFilter()
    return
  }

  // from ALL to ONE
  if (bubbleFilters.value.length === 5) {
    bubbleFilters.value = [element]
    mediaTypesCpy = []
    doSearchByFilter()
    return
  }
  const elIndex = bubbleFilters.value.indexOf(element)

  if (elIndex > -1) { // remove
    bubbleFilters.value.splice(elIndex, 1)
    switch(element) {
    case MediaTypes.VIDEO:
      removeFromBubbleCpy(RawMediaTypes.MEDIA_VIDEO)
      break
    case MediaTypes.IMAGE:
      removeFromBubbleCpy(RawMediaTypes.MEDIA_IMAGES_VISUALS)
      break
    case MediaTypes.AUDIO:
      removeFromBubbleCpy(RawMediaTypes.MEDIA_AUDIO)
      break
    case MediaTypes.DOCUMENT:
      removeFromBubbleCpy(RawMediaTypes.TEXT_BOOK)
      removeFromBubbleCpy(RawMediaTypes.TEXT_CHAPTER)
      removeFromBubbleCpy(RawMediaTypes.TEXT_DOCUMENT)
      removeFromBubbleCpy(RawMediaTypes.TEXT_PASSAGE)
      removeFromBubbleCpy(RawMediaTypes.TEXT_REFERENCE)
      removeFromBubbleCpy(RawMediaTypes.TEXT_WEBSITE)
      break
    case MediaTypes.INTERACTIVE:
      removeFromBubbleCpy(RawMediaTypes.INTERACTIVE_ANIMATION)
      removeFromBubbleCpy(RawMediaTypes.INTERACTIVE_SIMULATION)
      removeFromBubbleCpy(RawMediaTypes.INTERACTIVE_WHITEBOARD)
      break
    }
  } else { // add
    bubbleFilters.value.push(element)
  }

  // ------------------
  doSearchByFilter()
}

const clearFilters = () => {
  formData.schoolType = []
  formData.studyYear = []
  formData.publisher = []
  formData.federalState = []
  formData.grade = []
  formData.differentiation = []
  formData.schoolBook = []
}

const areFiltersSelected = computed(() => {
  return  formData.schoolType.length > 0
    || formData.studyYear.length > 0
    || formData.federalState.length > 0
    || formData.grade.length > 0
    || formData.differentiation.length > 0
    || formData.schoolBook.length > 0
})

const areFiltersApplied = computed(() => {
  return  (
    appliedFilters.schoolType.length > 0 ||
    appliedFilters.studyYear.length > 0 ||
    appliedFilters.publisher.length > 0 ||
    appliedFilters.federalState.length > 0 ||
    appliedFilters.grade.length > 0 ||
    appliedFilters.differentiation.length > 0 ||
    appliedFilters.schoolBook.length > 0
  )
})

const getLabelByKey = (array, key) => {
  return (array.find(el => el.key === key) || {}).label
}


watch(() => appliedFilters.sortType, () => {
  if (!disabledSortChangeWatcher.value) {
    setPageToFirst()
    doSearchByFilter()
  }
})

watch(() => formData.page, () => {
  if(!disabledPageChangeWatcher.value) {
    doSearchByFilter()
  }
})

watch(() => expandedFilters.value, () => {
  filterModalState.value = ''
})

const mapValuesToLabel = (type) => {
  return formData[type].map(el => {
    return (props.formItems[type].find(elRaw => {
      return elRaw.key === el
    }) || {}).label || undefined
  }).filter(el => el).join(' / ')
}
</script>

<template>
    <!-- MOBILE SORT -->
    <Modal
      v-model="sortByModalShow"
      fullscreen
      scrollable
      :scrim="false"
      transition="dialog-top-transition"
    >
      <div class="sortBy-menu color-black">
        <v-form @submit.prevent="sortByModalShow = false">
          <button type="submit" class="sortBy-menu-toolbar d-flex">
            <div>
              <ArrowLeftIcon class="mr-4 black-icon"/>
            </div>
            <div class="header-2">
                {{ $t('search.filters.sortBy') }}
            </div>
          </button>

          <div class="sortBy-menu-content">
            <label
              v-for="(sortType, index) in sortBy"
              :key="index"
              @click="sortByModalShow = false"
              class="input-radio"
            >
              <input
                type="radio"
                v-model="appliedFilters.sortType"
                :value="[sortType.key]"
              />
              {{  sortType.label }}
            </label>
          </div>
        </v-form>
      </div>
    </Modal>
    <!-- MOBILE FITLERS -->
    <Modal
      v-if="!mdAndUp"
      v-model="expandedFilters"
      persistent
      scrollable
      fullscreen
      :scrim="false"
      transition="dialog-top-transition"
    >
      <v-form
        class=""
        @submit.prevent="() =>{ expandedFilters = false; setPageToFirst(); doSearchByFilter() } "
      >
        <div  v-if="!filterModalState" class="filters-menu color-black">
          <div class="filters-menu-toolbar d-flex justify-space-between align-center">
            <h2 class="header-sm-2">
              {{ $t('search.filters.button') }}
            </h2>
            <div>
              <button type="button" @click="expandedFilters = false">
                <CloseIcon class="link black-icon" aria-hidden="true"/>
                <span class="sr-only">{{ $t('modal.close') }}</span>
              </button>
            </div>
          </div>
          <div class="filters-menu-content">
            <InputButton
              class="mt-6"
              @click="filterModalState = 'schoolType'"
              :active="mapValuesToLabel('schoolType') ? true : false"
              :text="mapValuesToLabel('schoolType') || $t('search.filters.schoolType')"
            >
              <TypeRightIcon class="black-icon" aria-hidden="true"/>
            </InputButton>
            <InputButton
              class="mt-6"
              @click="filterModalState = 'studyYear'"
              :active="mapValuesToLabel('studyYear') ? true : false"
              :text="mapValuesToLabel('studyYear') || $t('search.filters.studyYear')"
            >
              <TypeRightIcon class="black-icon" aria-hidden="true"/>
            </InputButton>
            <InputButton
              v-if="!isPublisher"
              class="mt-6"
              @click="filterModalState = 'publisher'"
              :active="mapValuesToLabel('publisher') ? true : false"
              :text="mapValuesToLabel('publisher') || $t('search.filters.publisher')"
            >
              <TypeRightIcon class="black-icon" aria-hidden="true"/>
            </InputButton>
            <InputButton
              class="mt-6"
              @click="filterModalState = 'federalState'"
              :active="mapValuesToLabel('federalState') ? true : false"
              :text="mapValuesToLabel('federalState') || $t('search.filters.federalState')"
            >
              <TypeRightIcon class="black-icon" aria-hidden="true"/>
            </InputButton>
            <InputButton
              class="mt-6"
              @click="filterModalState = 'grade'"
              :active="mapValuesToLabel('grade') ? true : false"
              :text="mapValuesToLabel('grade') || $t('search.filters.grade')"
            >
              <TypeRightIcon class="black-icon" aria-hidden="true"/>
            </InputButton>
            <InputButton
              class="mt-6"
              @click="filterModalState = 'differentiation'"
              :active="mapValuesToLabel('differentiation') ? true : false"
              :text="mapValuesToLabel('differentiation') || $t('search.filters.differentiation')"
            >
              <TypeRightIcon class="black-icon" aria-hidden="true"/>
            </InputButton>
            <InputButton
              class="mt-6"
              @click="filterModalState = 'schoolBook'"
              :active="mapValuesToLabel('schoolBook') ? true : false"
              :text="mapValuesToLabel('schoolBook') || $t('search.filters.schoolBook')"
            >
              <TypeRightIcon class="black-icon" aria-hidden="true"/>
            </InputButton>
          </div>
          <div class="search-buttons mt-6">
            <div class="search-buttons-container">
              <div class="button">
                <Button
                  @click="clearFilters"
                  :text="$t('search.filters.clearAll')"
                  variant="white"
                />
              </div>
              <div class="button">
                <Button
                  type="submit"
                  :text="$t('search.showResults')"
                  variant="black"
                />
              </div>
            </div>
          </div>
        </div>
        <div v-else class="filters-menu color-black">
          <button @click="filterModalState = ''" type="button" class="filters-menu-toolbar d-flex">
            <div>
              <ArrowLeftIcon class="mr-4 black-icon"/>
            </div>
            <div class="header-2">
                {{ $t(`search.filters.${filterModalState}`) }}
            </div>
          </button>
          <div class="filters-menu-content">
            <template
              v-if="filterModalState === 'federalState'"
            >
              <div
                v-for="(field, index) in formItems[filterModalState]"
                :key="index"
                class="flex"
                :class="index > 0 ? 'mt-8' : 'mt-0'"
              >
                <input
                  type="checkbox"
                  :id="`s_${filterModalState}_${index}`"
                  :value="field.key"
                  v-model="formData[filterModalState]"
                />
                <label
                  :for="`s_${filterModalState}_${index}`"
                  class="link pl-2"
                >
                  {{ field.label }}
                </label>
              </div>
            </template>
            <template v-else>
              <label
                v-for="(field, index) in formItems[filterModalState]"
                :key="index"
                class="input-radio"
              >
                <input
                  type="radio"
                  v-model="formData[filterModalState]"
                  :value="[field.key]"
                />
                {{ field.label }}
              </label>
            </template>
          </div>
          <div class="search-buttons mt-6">
            <div class="search-buttons-container">
              <div class="button">
                <Button
                  @click="formData[filterModalState] = []"
                  :text="$t('search.clean')"
                  variant="white"
                />
              </div>
              <div class="button">
                <Button
                  type="submit"
                  :text="$t('search.showResults')"
                  variant="black"
                />
              </div>
            </div>
          </div>
        </div>
      </v-form>
    </Modal>
    <!-- PC -->
    <div class="limited-width color-black">
      <v-form class="search-filters" @submit.prevent="() =>{ expandedFilters = false; setPageToFirst(); doSearchByFilter() }">
        <div class="d-none d-md-flex justify-space-between">
          <div class="search-filters-menu flex-wrap ">
            <Button
              type="button"
              class="white-icon"
              variant="white"
              :text="$t('search.filters.button')"
              :aria-expanded="expandedFilters"
              aria-controls="filters"
              @click="expandedFilters = !expandedFilters"
              :iconLeft="areFiltersApplied ? ActiveYesIcon : ActiveNoIcon"
              :iconRight="expandedFilters ? ArrowUpIcon : ArrowDownIcon"
            />

            <Button
              type="submit"
              v-if="expandedFilters && mdAndUp"
              variant="black"
              :text="$t('search.filters.saveFilters')"
            />

            <button
              @click="clearFilters"
              aria-live="polite"
              v-if="expandedFilters && areFiltersSelected && mdAndUp" class="link color-black font-button">
                {{ $t('search.filters.clearAll') }}
            </button>
          </div>
          <div v-if="areFiltersApplied && !expandedFilters && mdAndUp" class="search-filters-applied" aria-live="polite">
            <Tag
              v-if="appliedFilters.schoolType.length"
              :label="`${$t('search.filters.schoolType')}: ${getLabelByKey(formItems.schoolType, appliedFilters.schoolType[0])}`"
              @close="formData.schoolType = []; setPageToFirst(); doSearchByFilter()"
            />
            <Tag
              v-if="appliedFilters.studyYear.length"
              :label="`${$t('search.filters.studyYear')}: ${getLabelByKey(formItems.studyYear, appliedFilters.studyYear[0])}`"
              @close="formData.studyYear = []; setPageToFirst(); doSearchByFilter()"
            />
            <Tag
              v-if="appliedFilters.publisher.length"
              :label="`${$t('search.filters.publisher')}: ${getLabelByKey(formItems.publisher, appliedFilters.publisher[0])}`"
              @close="formData.publisher = []; setPageToFirst(); doSearchByFilter()"
            />
            <Tag
              v-for="(fs, index) in appliedFilters.federalState"
              :key="index"
              :label="`${$t('search.filters.federalState')}: ${getLabelByKey(formItems.federalState, fs)}`"
              @close="formData.federalState = formData.federalState.filter(el => el != fs); setPageToFirst(); doSearchByFilter()"
            />
            <Tag
              v-for="(fs, index) in appliedFilters.grade"
              :key="index"
              :label="`${$t('search.filters.grade')}: ${getLabelByKey(formItems.grade, fs)}`"
              @close="formData.grade = formData.grade.filter(el => el != fs); setPageToFirst(); doSearchByFilter()"
            />
            <Tag
              v-for="(fs, index) in appliedFilters.differentiation"
              :key="index"
              :label="`${$t('search.filters.differentiation')}: ${getLabelByKey(formItems.differentiation, fs)}`"
              @close="formData.differentiation = formData.differentiation.filter(el => el != fs); setPageToFirst(); doSearchByFilter()"
            />
            <Tag
              v-for="(fs, index) in appliedFilters.schoolBook"
              :key="index"
              :label="`${$t('search.filters.schoolBook')}: ${getLabelByKey(formItems.schoolBook, fs)}`"
              @close="formData.schoolBook = formData.schoolBook.filter(el => el != fs); setPageToFirst(); doSearchByFilter()"
            />
          </div>

          <div v-if="!isPublisher" class="sort-by flex">
            <div class="sort-by-label font-type-b5 color-black">
              {{ $t('search.filters.sortBy') }}:
            </div>
            <Select
              class="sort-by-select ml-4"
              :items="sortBy"
              noEmpty
              :aria-label="$t('search.filters.sortBy')"
              v-model="appliedFilters.sortType"/>
          </div>
        </div>
        <v-slide-y-transition>
          <div v-show="expandedFilters && mdAndUp" id="filters" role="filters" class="color-black search-filters-advance">
            <!-- ROW 1 -->
            <div class="flex flex-wrap search-filters-advance-row">
              <Select
                :label="$t('search.filters.schoolType')"
                :items="formItems.schoolType"
                v-model="formData.schoolType"/>
              <Select
                :label="$t('search.filters.studyYear')"
                :items="formItems.studyYear"
                v-model="formData.studyYear"/>
              <Select
                v-if="!isPublisher"
                :label="$t('search.filters.publisher')"
                :items="formItems.publisher"
                v-model="formData.publisher"/>
            </div>
            <!-- ROW 2 -->
            <div class="flex flex-wrap search-filters-advance-row">
              <Select
                :label="$t('search.filters.federalState')"
                :items="formItems.federalState"
                v-model="formData.federalState"
                multiple
              />
              <Select
                :label="$t('search.filters.grade')"
                :items="formItems.grade"
                v-model="formData.grade"
              />
              <Select
                :label="$t('search.filters.differentiation')"
                :items="formItems.differentiation"
                v-model="formData.differentiation"
              />
              <Select
                :label="$t('search.filters.schoolBook')"
                :items="formItems.schoolBook"
                v-model="formData.schoolBook"
              />
            </div>
          </div>
        </v-slide-y-transition>

        <div class="justify-center d-none d-md-flex">
          <div class="search-filters-types | justify-space-between flex flex-wrap mt-8 mb-8">
            <button
              class="filter-bubble text-center link"
              :class="{ active: bubbleFilters.length === 5 }"
              @click.prevent="toggleFilter([ MediaTypes.DOCUMENT, MediaTypes.IMAGE, MediaTypes.AUDIO, MediaTypes.VIDEO, MediaTypes.INTERACTIVE])"
            >
              <BubbleAll aria-hidden="true"/>
              <span
                v-if="bubbleFilters.length === 5"
                class="sr-only">{{ $t('search.filters.srOnly.deactivate') }} </span>
              <span
                v-if="bubbleFilters.length !== 5"
                class="sr-only">{{ $t('search.filters.srOnly.activate') }} </span>
              <div class="bubble-label">{{ $t('search.bubbles.all') }}</div>
            </button>
            <button
              v-for="(bubble, key) in bubbles"
              :key=key
              class="filter-bubble text-center link"
              :class="{ active: bubbleFilters.includes(bubble.mediaType) && bubbleFilters.length < 5}"
              @click.prevent="toggleFilter(bubble.mediaType)"
            >
              <component :is="bubble.component" aria-hidden="true"/>
              <span
                v-if="bubbleFilters.includes(bubble.mediaType)"
                class="sr-only">{{ $t('search.filters.srOnly.deactivate') }} </span>
              <span
                v-if="!bubbleFilters.includes(bubble.mediaType)"
                class="sr-only">{{ $t('search.filters.srOnly.activate') }} </span>
              <div class="bubble-label">{{ bubble.label }}</div>
            </button>
          </div>
        </div>
        <!-- MOBILE -->
        <swiper-container
          class="d-md-none m-sm-block mt-4 w-100"
          slides-per-view="auto"
          space-between="24"
          grab-cursor
          :keyboard="{
            enabled: true,
            onlyInViewport: true
          }"
        >
          <swiper-slide
            class="bubble-swiper-tile flex"
          >
            <button
              class="filter-bubble text-center link"
              :class="{ active: bubbleFilters.length === 5 }"
              @click.prevent="toggleFilter([ MediaTypes.DOCUMENT, MediaTypes.IMAGE, MediaTypes.AUDIO, MediaTypes.VIDEO, MediaTypes.INTERACTIVE ])"
            >
              <BubbleAllMobile width="56" height="56" aria-hidden="true"/>
              <div class="bubble-label font-type-b5">{{ $t('search.bubbles.all') }}</div>
            </button>
          </swiper-slide>
          <swiper-slide
            class="bubble-swiper-tile flex"
            v-for="(bubble, key) in bubbles"
            :key="key"
          >
            <button
              type="button"
              class="filter-bubble text-center link"
              :class="{ active: bubbleFilters.includes(bubble.mediaType) && bubbleFilters.length < 5}"
              @click.prevent="toggleFilter(bubble.mediaType)"
            >
              <component :is="bubble.componentMobile" aria-hidden="true"/>
              <div class="bubble-label font-type-b5">{{ bubble.label }}</div>
            </button>
          </swiper-slide>
        </swiper-container>
        <div class="d-flex d-md-none mobile-buttons">
          <div class="mobile-buttons-button">
            <Button
              class="white-icon"
              variant="black"
              @click="expandedFilters = !expandedFilters"
            >
              <component
                :is="areFiltersApplied ? ActiveYesMobileIcon  : ActiveNoIcon"
                class="mr-2"
              />
              {{ $t('search.filters.button') }}
            </Button>
          </div>
          <div class="mobile-buttons-button">
            <Button
              @click="sortByModalShow = true"
              variant="white"
            >
              <SortIcon class="mr-2"/>
              {{ $t('search.filters.sortBy') }}
            </Button>
          </div>
        </div>
      </v-form>
      <!-- MOBILE badges -->
      <swiper-container
          v-if="areFiltersApplied && !expandedFilters && !mdAndUp"
          class="search-filters-applied"
          aria-live="polite"
          slides-per-view="auto"
          space-between="16"
          grab-cursor
          :keyboard="{
            enabled: true,
            onlyInViewport: true
          }"
        >
        <swiper-slide v-if="appliedFilters.schoolType.length" class="flex">
          <Tag
            :label="`${$t('search.filters.schoolType')}: ${getLabelByKey(formItems.schoolType, appliedFilters.schoolType[0])}`"
            @close="formData.schoolType = []; setPageToFirst(); doSearchByFilter()"
          />
        </swiper-slide>
        <swiper-slide v-if="appliedFilters.studyYear.length" class="flex">
          <Tag
            :label="`${$t('search.filters.studyYear')}: ${getLabelByKey(formItems.studyYear, appliedFilters.studyYear[0])}`"
            @close="formData.studyYear = []; setPageToFirst(); doSearchByFilter()"
          />
        </swiper-slide>
        <swiper-slide v-if="appliedFilters.publisher.length" class="flex">
          <Tag
            :label="`${$t('search.filters.publisher')}: ${getLabelByKey(formItems.publisher, appliedFilters.publisher[0])}`"
            @close="formData.publisher = []; setPageToFirst(); doSearchByFilter()"
          />
        </swiper-slide>
        <swiper-slide
          v-for="(fs, index) in appliedFilters.federalState" class="flex"
          :key="index"
        >
          <Tag
            :label="`${$t('search.filters.federalState')}: ${getLabelByKey(formItems.federalState, fs)}`"
            @close="formData.federalState = formData.federalState.filter(el => el != fs); setPageToFirst(); doSearchByFilter()"
          />
        </swiper-slide>
        <swiper-slide v-if="appliedFilters.grade.length" class="flex">
          <Tag
            :label="`${$t('search.filters.grade')}: ${getLabelByKey(formItems.grade, appliedFilters.grade[0])}`"
            @close="formData.grade = []; setPageToFirst(); doSearchByFilter()"
          />
        </swiper-slide>
        <swiper-slide v-if="appliedFilters.differentiation.length" class="flex">
          <Tag
            :label="`${$t('search.filters.differentiation')}: ${getLabelByKey(formItems.differentiation, appliedFilters.differentiation[0])}`"
            @close="formData.differentiation = []; setPageToFirst(); doSearchByFilter()"
          />
        </swiper-slide>
        <swiper-slide v-if="appliedFilters.schoolBook.length" class="flex">
          <Tag
            :label="`${$t('search.filters.schoolBook')}: ${getLabelByKey(formItems.schoolBook, appliedFilters.schoolBook[0])}`"
            @close="formData.schoolBook = []; setPageToFirst(); doSearchByFilter()"
          />
        </swiper-slide>
      </swiper-container>

  </div>
</template>

<style lang="scss" scoped>

  .search-filters {
    display: flex;
    flex-direction: column;
    gap: 32px;

    &-menu {
      display: flex;
      align-items: center;
      align-self: flex-start;
      gap: 32px;
      margin-top: 22px;


      .icon-left {
        margin-right: 30px;
      }
      .icon-right {
        margin-left: 30px;
      }
    }

    &-applied {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
      align-items: center;
      gap: 24px;
      height: 100%;
      width: 100%;
      margin: 22px 40px 0 40px;
      border: 1px solid $color-primary-5;
      padding: 12px 32px;
    }

    .sort-by {
      flex-shrink: 0;
      &-label {
        margin-top: 38px;
      }
      &-select {
        display: inline-block;
        min-width: 184px;
      }
    }

    &-advance {
      margin-bottom: 32px;

      &-row {
        margin-top: 20px;
        gap: 40px;

        & > div {
          flex: 1;
        }
      }
    }

    &-types {
      width: 1020px;
    }

    .bubble-swiper-tile {
      width: 56px;
    }

    .mobile-buttons {
      gap: 16px;

      &-button {
        width: 50%;
      }
    }
  }

  .sortBy-menu {
    background-color: $color-grey-6;
    width: 100%;
    height: 100%;
    overflow-y: scroll;
    display: flex;
    flex-direction: column;

    &-toolbar {
      position: sticky;
      top: 0;
      z-index: 6;
      padding: 64px 16px 16px 16px;
    }

    &-content {
      background-color: #fff;
      margin: 32px 16px 0 16px;
      padding: 20px 16px;
    }
  }

  .filters-menu {
    background-color: $color-grey-6;
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;

    &-toolbar {
      padding: 64px 16px 16px 16px;
    }

    &-content {
      background-color: #fff;
      margin: 32px 16px 128px 16px;
      padding: 20px 16px;
      overflow-y: auto;
    }
    .search-buttons {
      position: fixed;
      bottom: 0;
      padding: 24px;
      width: 100%;
      background-color: #FFF;
      box-shadow: 0px 0px 40px 0px #0000001A;

      &-container {
        display: flex;
        gap: 8px;

        .button {
          width: 50%;
        }
      }
    }
  }

  @media (max-width: $MAX-WIDTH-MOBILE) {
    .search-filters {
      margin: 32px 16px;

      &-applied {
        margin: 24px 16px 0 16px;
        display: block;
        padding: 0;
        border: none;

        swiper-slide {
          width: auto;
        }
      }
    }
  }
</style>
