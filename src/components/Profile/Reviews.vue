<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'
import { scrollTo } from '@/helpers/ui'
import { service } from '@/helpers/api'
import { mapRawResult } from '@/components/Search/commons/Search.helper'
import MediaTypes  from '@/enums/mediatypes'
import Modal from '@/components/Modal/Modal.vue'
import Pagination from '@/components/Pagination/Pagination.vue'
import Select from '@/components/Forms/Select.vue'
import Button from '@/components/Button/Button.vue'
import Loader from '@/components/Loader/Loader.vue'
import VotingDialog from '@/components/Rating/VotingDialog.vue'

import StarSemi from '@/assets/icons/Star-semi.svg'
import ArrowLeftIcon from '@/assets/icons/Side=Left.svg'
import SortIcon from '@/assets/icons/Sort.svg'

const { t } = useI18n()
const { mdAndUp } = useDisplay()

const fetchingResults = ref(false)
const error = ref(false)
const ratingChanged = ref(false)
const ratingDeleted = ref(false)
const sortByModalShow = ref(false)
const reviews = ref([])
const totalElements = ref(0)
const editDialogOptions = reactive({
  title: '',
  comment: '',
  currentVote: 0,
  id: null,
  open: false
})

const formData = reactive({
  sortType: ['publishDate-desc'],
  page: 1
})

const sortBy = computed(() => ([
  { key: 'name-asc', label: t('search.filters.sortTypes.alphabetic') },
  { key: 'relevance-desc', label: t('search.filters.sortTypes.mostViewed') },
  { key: 'publishDate-desc', label: t('rating.sortBy.date.newest') },
  { key: 'publishDate-asc', label: t('rating.sortBy.date.oldest') }
]))

watch(formData, () => {
  doSearch()
})

const doSearch = async (disableScroll) => {
  fetchingResults.value = true
  error.value = false
  try {
    const sortType = formData.sortType[0].split('-')
    const { data } = await service.get('/ratings/own',
      {
        params: {
          page: formData.page - 1,
          size: 6,
          sort: [
            sortType[0], sortType[1]
          ],
        }
      }
    )
    totalElements.value = data.totalElements
    reviews.value = data.content.map(el => {
      el.myRating.text = el.myRating.text || ''
      return {
        ...mapRawResult(el),
        myRating: {
          ...el.myRating,
          comment: el.myRating.text.slice(0, 114),
          commentMore: el.myRating.text.slice(114),
          showMore: ref(false)
        }
      }
    })
  } catch (e) {
    error.value = true
    console.log('error %o', e)
  }

  if (!disableScroll) {
    scrollTo('.progress-bar', !mdAndUp.value)
  }
  fetchingResults.value = false
}

const getBackgroundImage = (res) => {
  if (res.image) return res.image
  switch (res.type) {
  case MediaTypes.IMAGE:
    return '/PlaceholderPhoto.svg'
  case MediaTypes.VIDEO:
    return '/PlaceholderVideo.svg'
  case MediaTypes.AUDIO:
    return '/PlaceholderAudio.svg'
  default:
    return '/PlaceholderDocument.svg'
  }
}

const editRating = (material) => {
  editDialogOptions.title = material.title
  editDialogOptions.comment = material.myRating.text
  editDialogOptions.currentVote = material.myRating.rating
  editDialogOptions.id = material.myRating.id
  editDialogOptions.open = true
}

doSearch(true)
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
              v-model="formData.sortType"
              :value="[sortType.key]"
            />
            {{  sortType.label }}
          </label>
        </div>
      </v-form>
    </div>
  </Modal>
  <div class="color-black">
    <VotingDialog
      v-if="editDialogOptions.open && editDialogOptions.id"
      :title="editDialogOptions.title"
      :pComment="editDialogOptions.comment"
      :pCurrentVote="editDialogOptions.currentVote"
      :id="editDialogOptions.id"
      v-model:open="editDialogOptions.open"
      @changed="() =>{ ratingChanged = true; doSearch() }"
      @deleted="() =>{ ratingDeleted = true; doSearch() }"
      edit
    />
    <v-snackbar
        v-model="ratingChanged" multi-line
        location="top"
        position="fixed"
        variant="flat"
        color="#2A823D"
        timeout="5000"
      >
      <div class="font-type-b5">
        {{ $t('reviews.ratingChanged') }}
      </div>
    </v-snackbar>
    <v-snackbar
        v-model="ratingDeleted" multi-line
        location="top"
        position="fixed"
        variant="flat"
        color="#2A823D"
        timeout="5000"
      >
      <div class="font-type-b5">
        {{ $t('reviews.ratingDeleted') }}
      </div>
    </v-snackbar>
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
            @click="doSearch"
            :text="$t('errors.refresh')"
            variant="black"
            compact
        />
      </template>
    </v-snackbar>
    <!-- PROGRESS BAR-->
    <Loader v-if="fetchingResults" class="progress-bar" />
    <div v-else class="limited-width mb-3 mb-md-16 pt-8 pt-md-0 w-100">
    <div>
      <div class="d-block d-md-flex justify-space-between align-center mb-md-16">
        <div class="flex justify-space-between align-end">
          <div class="d-block d-md-flex align-center">
              <h2 class="header-md-6 header-sm-2 color-black">{{ $t("reviews.header") }}</h2>
              <div class="header-md-7 font-type-sm-b2 color-grey-4 ml-0 ml-md-4">{{ totalElements }} {{ $t('search.results') }}</div>
            </div>
          </div>
          <v-form
            @submit.prevent="doSearch"
            class="form-container d-none d-md-flex"
          >
            <div class="sort-by flex ml-14">
              <div class="sort-by-label font-type-b5 color-black">
                {{ $t('search.filters.sortBy') }}:
              </div>
              <Select
                class="sort-by-select ml-4"
                :items="sortBy"
                noEmpty
                :aria-label="$t('search.filters.sortBy')"
                v-model="formData.sortType"/>
            </div>
            <v-btn class="d-none" type="submit"/>
          </v-form>
          <div class="d-block d-md-none mt-4 mb-6">
            <Button
              @click="sortByModalShow = true"
              variant="white"
            >
              <SortIcon class="mr-2"/>
              {{ $t('search.filters.sortBy') }}
            </Button>
          </div>
        </div>
      </div>
    </div>
    <div class="mb-12">
      <div v-for="(rev, index) in reviews" :key="index" class="tile">
        <router-link
          :to="`/material/${rev.publisher.id}/${rev.id}`"
        >
          <div class="tile-image"
            :class="{placeholder: rev.image === undefined}"
            >
              <div
                class="tile-image-background"
                :style="{background: `linear-gradient(0deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)),  url(${getBackgroundImage(rev)})  0 0/100% 100%`}">
              </div>
              <img :src="getBackgroundImage(rev)" :alt="rev.title"/>
          </div>
        </router-link>
        <div class="tile-content">
          <div class="tile-content-bar flex justify-space-between mb-md-4 mb-6">
            <div class="header-md-8 header-sm-2">{{ rev.title }}</div>
            <button
              type="button"
              class="d-block edit link"
              @click="() => editRating(rev)"
            >
              <span class="sr-only">
                {{
                  $t('rating.edit')
                }}
              </span>
            </button>
          </div>
          <div class="font-type-md-b3 header-sm-9 mb-2">{{  $t("reviews.yourRating") }}</div>
          <div class="stars flex mb-md-4 mb-6">
            <StarSemi
              aria-hidden="true"
              v-for="val in 5" :key="val"
              class="star-semi pr-1 h-100"
              :class="{'active': rev.myRating.rating >= val }"
            />
          </div>
          <div class="font-type-md-b3 header-sm-9 mb-2">{{  $t("reviews.yourComment") }}</div>
          <div class="font-type-md-b5 header-sm-7 pr-md-160 mb-md-4 mb-2">
            <template v-if="mdAndUp">
              "{{ rev.myRating.comment || $t('rating.emptyComment') }}"
            </template>
            <template v-else>
              <template v-if="rev.myRating.commentMore.length">
                "{{ rev.myRating.comment }}<template v-if="!rev.myRating.showMore">...
                  <button class="link underline color-grey-1" @click="rev.myRating.showMore=true"> {{ $t('rating.commentMore') }}</button>
                </template>
                <template v-else>{{ rev.myRating.commentMore }}"</template>
              </template>
              <template v-else>
                "{{ rev.myRating.comment || $t('rating.emptyComment') }}"
              </template>
            </template>
          </div>
          <div class="header-md-10 font-type-sm-b2 color-grey-4">{{ rev.myRating.modifiedAt }}</div>
        </div>
      </div>
      <div v-if="totalElements > 6">
        <Pagination
          class="mt-12 mb-12"
          v-model="formData.page"
          :maxPages="totalElements ? Math.ceil(totalElements / 6) : 0"
        />
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>

.tile {
  background-color: $color-grey-6;
  margin-bottom: 46px;
  padding: 48px;
  display: flex;

  &-image {
    margin-right: 64px;
    overflow: hidden;
    min-height: 264px;
    width: 300px;
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
      transform: translateY(-50%) translateX(-50%);
    }
  }

  &-content {
    flex: 1;

    &-bar {
      gap: 24px;
    }
    .edit {
      width: 40px;
      height: 40px;
      min-width: 40px;
      min-height: 40px;
      background-image: url('/img/Pencil.svg');

      &:hover, &:focus {
        outline: none;
        background-image: url('/img/PencilActive.svg');
      }
    }

    .stars {
      .star-semi, &:focus {
        fill: $color-primary-10;

        &.active, &:focus.link {
          fill: $color-yellow;
        }
        &:hover ~.star-semi:not(.active) {
          fill: $color-primary-10;
        }
      }
    }
  }
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

  @media (max-width: $MAX-WIDTH-MOBILE) {
    .tile {
      margin-bottom: 24px;
      padding: 24px 16px;
      display: flex;

      &-image {
        display: none;
      }

      &-content {
        flex: 1;

        .stars {
          .star-semi, &:focus {
            fill: $color-primary-10;

            &.active, &:focus.link {
              fill: $color-yellow;
            }
            &:hover ~.star-semi:not(.active) {
              fill: $color-primary-10;
            }
          }
        }
      }
    }
  }
</style>