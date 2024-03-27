<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'

import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'
import { service } from '@/helpers/api'

import Tag from '@/components/Tag/Tag.vue'
import Modal from '@/components/Modal/Modal.vue'
import Button from '@/components/Button/Button.vue'
import Select from '@/components/Forms/Select.vue'
import Loader from '@/components/Loader/Loader.vue'
import Pagination from '@/components/Pagination/Pagination.vue'

import SortIcon from '@/assets/icons/Sort.svg'
import StarSemi from '@/assets/icons/Star-semi.svg'
import CloseIcon from '@/assets/icons/Exit.svg'
import StarRating1 from '@//assets/icons/StarRating1.svg'
import StarRating2 from '@//assets/icons/StarRating2.svg'
import StarRating3 from '@//assets/icons/StarRating3.svg'
import StarRating4 from '@//assets/icons/StarRating4.svg'
import StarRating5 from '@//assets/icons/StarRating5.svg'
import ArrowLeftIcon from '@/assets/icons/Side=Left.svg'
import HollowStarIcon from '@/assets/icons/StarHollow.svg'


const emit = defineEmits(['update:open', 'rated'])

const props = defineProps({
  open: { type: Boolean, default: false },
  materialId: { type: String, defailt: String },
  publisherId: { type: String, defailt: String },
  title: { type: String, default: ''}
})

const { t } = useI18n()
const { mdAndUp } = useDisplay()
const fetched = ref(false)
const loading = ref(false)
const sortByModalShow = ref(false)
const startSelectModalShow = ref(false)
const mobileStarSelect = ref([])
const rating = ref({
  comments: {},
  votes: {},
  rated: false
})

const totalRatingsCount = ref(0)

const showDialog = computed({
  get () {
    return props.open
  },
  set (value) {
    return emit('update:open', value)
  }
})
const currentRating = ref(0)

const bigStarComponent = computed(() => {
  switch (currentRating.value) {
  case 5: return StarRating5
  case 4: return StarRating4
  case 3: return StarRating3
  case 2: return StarRating2
  default: return StarRating1
  }
})

const formData = reactive({
  sortType: ['desc'],
  filter: [],
  page: 1
})

const sortBy = computed(() => ([
  { key: 'desc', label: t('rating.sortBy.date.newest') },
  { key: 'asc', label: t('rating.sortBy.date.oldest') }
]))

const filterBy = computed(() => ([
  { key: 5, label: t('rating.sortBy.rating.5stars') },
  { key: 4, label: t('rating.sortBy.rating.4stars') },
  { key: 3, label: t('rating.sortBy.rating.3stars') },
  { key: 2, label: t('rating.sortBy.rating.2stars') },
  { key: 1, label: t('rating.sortBy.rating.1star') },
]))

watch([ () => formData.filter, () => formData.sortType, () => formData.page ], () => {
  formData.page = 1
  fetch()
})

watch(() => props.open, () => {
  if (props.open === true) fetch()
})

const initRating = async () => {
  await fetch()
  if(rating.value.rated) {
    emit('rated', rating)
  }
  fetched.value = true
}

const fetch = async () => {
  loading.value = true
  try {
    const response = await service.get(`/ratings/${props.publisherId}/${props.materialId}`,
      {
        params: {
          page: formData.page - 1,
          size: 15,
          sort: [
            'createdAt', formData.sortType[0]
          ],
          rating: formData.filter.length === 0 ? [0] : formData.filter
        }
      }
    )
    currentRating.value = parseInt(response.data.rating) || 0
    totalRatingsCount.value = parseInt(response.data.totalRatingsCount) || 0
    rating.value = response.data
  } catch (e) {
    console.log('error: %o', e)
  }
  loading.value = false
}

const filteredComments = computed(() => {
  return rating.value.comments.content
})

const allVotes = computed(() => Object.values(rating.value.votes).reduce((acc, val) => acc + val, 0))

const calculateVotesPercentage = (val) => `background-size: ${allVotes.value === 0 ? 0 : val * 100 / allVotes.value}% 6px`

const removeFilterByKey = (val) => {
  formData.filter = formData.filter.filter(el => el !== val)
}

watch(() => showDialog.value, (val) => {
  document.querySelector('html').classList.toggle('overflow-hidden', val)

  if(val) nextTick(() => document.querySelector('.full-rating button')?.focus())
})

watch(() => startSelectModalShow.value, (val) => {
  if(val) {
    mobileStarSelect.value = formData.filter
  }
})

initRating()

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
    <div class="modal-select color-black">
      <v-form @submit.prevent="sortByModalShow = false">
        <div class="modal-select-toolbar">
          <button class="flex">
            <div>
              <ArrowLeftIcon class="mr-4 black-icon" aria-hidden="true"/>
            </div>
            <div class="header-2">
              {{ $t('rating.sortBy.label') }}
            </div>
          </button>
        </div>

        <div class="modal-select-content">
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

  <!-- MOBILE STAR SELECT -->
  <Modal
    v-model="startSelectModalShow"
    scrollable
    :scrim="false"
    transition="dialog-top-transition"
  >
      <v-form
        class="modal-select color-black"
        @submit.prevent="startSelectModalShow = false">
        <div class="modal-select-toolbar flex">
          <button class="flex">
            <div>
              <ArrowLeftIcon class="mr-4 black-icon" aria-hidden="true"/>
            </div>
            <div class="header-2">
              {{ $t('rating.allStars') }}
            </div>
          </button>
        </div>
        <div class="modal-select-content stars">
          <div
            v-for="(filter, index) in filterBy"
            :key="index"
            class="flex"
            :class="index > 0 ? 'mt-8' : 'mt-0'"
          >
            <input
              type="checkbox"
              class=""
              :id="`s_${index}`"
              :value="filter.key"
              v-model="mobileStarSelect"
            />
            <label
              :for="`s_${index}`"
              class="link pl-2">
               {{ filter.key }} *
            </label>
          </div>
        </div>
        <div
          class="modal-buttons mt-6 mt-md-0"
        >
          <div class="modal-buttons-container">
            <div class="button">
              <Button
                type="button"
                @click="startSelectModalShow = false"
                :text="$t('rating.cancel')"
                variant="white"
              />
            </div>
            <div class="button">
              <Button
                type="submit"
                :text="$t('rating.showResults')"
                @click="formData.filter = mobileStarSelect; startSelectModalShow = false"
                variant="black"
              />
            </div>
          </div>
        </div>
      </v-form>
  </Modal>
  <!-- OVERLAY -->
  <v-overlay
    v-if="fetched"
    v-model="showDialog"
    transition="scroll-x-reverse-transition"
    scroll-strategy="none"
    aria-modal="true"
    role="dialog"
    class="justify-end">
    <div class="full-rating color-black">
      <div class="full-rating-toolbar flex justify-end">
        <button
          class="link"
          @click="() => showDialog = false"
          type="button"
        >
          <span class="sr-only">{{ $t('modal.close') }}</span>
          <CloseIcon class="link black-icon" aria-hidden="true"/>
        </button>
      </div>
      <div class="full-rating-content">
        <div class="header-md-4 header-sm-1">{{ $t('rating.header') }}</div>
        <div class="font-type-md-b4 header-sm-7 mt-2">{{ title }}</div>
        <div class="full-rating-content-box justify-space-between">
          <div class="full-rating-content-box-scores">
            <component
              :is="bigStarComponent"
              :height="mdAndUp ? 126 : 56"
              :width="mdAndUp ? 126 : 56"
              :class="`big-star-${currentRating}`"
            />
            <div class="header-md-4 header-sm-7">
              <span class="color-black">{{ rating.rating }}</span><span class="color-primary-20">/5.0</span>
            </div>
            <div class="full-rating-content-box-scores-info font-type-md-b6 font-type-sm-b7">
              {{ allVotes }} {{ $t(`rating.${allVotes === 1 ? 'rating' : 'ratings'}`) }},
              {{ rating.totalRatingsCount - rating.emptyRatings }}
              {{ $t(`rating.${(rating.totalRatingsCount - rating.emptyRatings) === 1 ? 'comment' : 'comments'}`) }}
            </div>
          </div>
          <div class="separator d-flex"></div>
          <div class="full-rating-content-box-details">
            <div
              v-for=" val in 5" :key="val"
              class="full-rating-content-box-details-row stars"
            >
              <span class="font-type-md-b1 font-type-sm-b5 mr-2 full-rating-content-box-details-row-number">
                {{ val }}
              </span>
              <StarSemi
                v-for="rating in 5"
                :key="rating"
                class="star-semi"
                :height="mdAndUp ? 28 : 16"
                :width="mdAndUp ? 28 : 16"
                :class="rating <= val ? 'active' : 'inactive'"
              />
              <div class="ml-4 ml-md-6 align-self-center">
                <div class="bar" :style="calculateVotesPercentage(rating.votes[val])"></div>
              </div>
              <div class="font-type-sm-b7 header-md-9 ml-4 ml-md-6 mr-0 full-rating-content-box-details-row-votes">
                ({{ rating.votes[val] }})
              </div>
            </div>
          </div>
        </div>
        <div class="full-rating-content-comments mb-5">
          <div class="d-flex d-md-none mt-6 mobile-buttons">
            <div class="mobile-buttons-button">
              <Button
                @click="startSelectModalShow = true"
                class="white-icon"
                variant="black"
              >
                <HollowStarIcon class="mr-2" aria-hidden="true"/>
                {{ $t('rating.allStars') }}
              </Button>
            </div>
            <div class="mobile-buttons-button">
              <Button
                @click="sortByModalShow = true"
                variant="white"
              >
                <SortIcon class="mr-2" aria-hidden="true"/>
                {{ $t('rating.sortBy.label') }}
              </Button>
            </div>
          </div>
          <div class="sort-by d-none d-md-flex">
            <div class="d-flex">
              <div class="sort-by-label font-type-b5 color-black">
                {{ $t('rating.sortBy.label') }}:
              </div>
              <Select
                class="sort-by-select ml-4"
                :items="sortBy"
                noEmpty
                :aria-label="$t('rating.sortBy.label')"
                v-model="formData.sortType"
              />
            </div>
            <div class="d-flex">
              <div class="sort-by-label font-type-b5 color-black ml-12">
                {{  $t('rating.sortBy.ratingLabel') }}
              </div>
              <Select
                class="sort-by-select ml-4"
                :items="filterBy"
                noEmpty
                multiple
                :aria-label="$t('rating.sortBy.ratingLabel')"
                v-model="formData.filter"
                />
            </div>
          </div>
          <div class="header-md-8 header-sm-2 mt-md-6 mt-10">{{ $t('rating.commentRating') }}</div>

          <!-- MOBILE TAGS-->
          <div class="d-block d-md-none">
            <swiper-container
              v-if="formData?.filter.length"
              class="search-filters-applied"
              slides-per-view="auto"
              space-between="16"
              grab-cursor
              :keyboard="{
                enabled: true,
                onlyInViewport: true
              }"
            >
              <swiper-slide v-for="(val, index) in formData.filter" class="flex" :key="index">
                <Tag
                  :label="`${val}*`"
                  @close="removeFilterByKey(val)"
                />
              </swiper-slide>
            </swiper-container>

          </div>

          <Loader v-if="loading"/>
          <template  v-else>
            <div v-for="(comment, index) in filteredComments" :key="index" class="comment mt-6" aria-live="polite" >
              <div class="flex stars">
                <StarSemi
                  v-for="rating in 5"
                  :key="rating"
                  :height="mdAndUp ? 27 : 24"
                  :width="mdAndUp ? 27 : 24"
                  class="star-semi"
                  :class="rating <= comment.rating ? 'active' : 'inactive'"
                />
                <div class="comment-date font-type-md-b5 font-type-sm-b2 color-grey-3 align-self-end">{{  comment.modifiedAt }}</div>
              </div>
              <div
                class="comment-text font-type-md-b5 font-type-sm-b2"
                :class="{'color-grey-4': !comment.text}"
              >
                {{ comment.text || $t('rating.emptyComment') }}
              </div>
            </div>
          </template>
          <Pagination v-if="!loading && totalRatingsCount > 20" v-model="formData.page" :maxPages="rating.comments.totalElements ? Math.ceil(rating.comments.totalElements / 20) : 0 "/>
        </div>
      </div>
    </div>
  </v-overlay>
</template>

<style lang="scss" scoped>
  .bar {
    height: 6px;
    width: 142px;
    position: relative;
    background-image: linear-gradient($color-yellow, $color-yellow);
    background-position: 0 0;
    background-color: $color-primary-10;
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

  .show-rating {
    margin-bottom: 10px;
    margin-left: 8px;
  }

  .full-rating {
    position: absolute;
    background-color: #fff;
    overflow: auto;
    height: 100vh;
    width: 856px;
    right: 0;

    &-toolbar {
      position: sticky;
      top: 0;
      z-index: 1;
      padding: 32px 40px 0 40px;
      background-color: #FFF;
    }
    &-content {
      padding: 0 40px;

      &-box {
        display: flex;
        flex-wrap: wrap;
        padding: 24px;
        background-color: $color-grey-8;
        margin-top: 48px;

        &-scores {
          text-align: center;
          width: 250px;
        }

        &-details {
          display: flex;
          flex-direction: column-reverse;
          margin-top: 20px;
          justify-content: flex-end;

          &-row {
            display: flex;

            .star-semi {
              margin-right: 2px;
            }

            &-number {
              display: inline-block;
              height: 32px;
              width: 16px;
            }

            &-votes {
              margin-top: 2px;
              width: 40px;
              text-align: center;
            }
          }
        }
        .separator {
          display: flex;
          align-self: center;
          height: 144px;
          border-right: 1.5px solid $color-primary-10;
        }
      }

      &-comments {
        .comment-date {
          margin-left: 10px;
        }
        .comment-text {
          margin-top: 10px;
        }
      }
    }
  }

  .sort-by {
    &-label {
      margin-top: 38px;
    }
    &-select {
      flex: 184px 0 1;
    }
  }

  @media (max-width: $MAX-WIDTH-MOBILE) {
    .bar {
      height: 2.5px;
      width: 48px;
    }
    .full-rating {
      width: 100vw;

      &-toolbar {
        padding: 32px 16px 8px 16px;
      }

      &-content {
        padding: 24px 16px 0 16px;

        &-box {
          margin-top: 24px;

          &-scores {
            width: 112px;
          }
          &-details {
            margin-top: 0;
            padding: 8px;

            &-row {
              &-number {
                height: 16px;
                width: 10px;
              }
              &-votes {
                margin-top: 2px;
                width: auto;
              }
            }
          }

          .separator {
            height: 60px;
          }
        }

        &-comments {
          .mobile-buttons {
            gap: 16px;

            &-button {
              width: 50%;
            }
          }
          .comment-text {
            margin-top: 0
          }
        }
      }
    }

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

  .modal-select {
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
      margin: 32px 16px 80px 16px;
      padding: 20px 16px;
      overflow-y: scroll;

      &.stars {
        padding: 32px 16px;
      }
    }

    .modal-buttons {
      position: fixed;
      padding: 24px;
      bottom: 0;
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
</style>