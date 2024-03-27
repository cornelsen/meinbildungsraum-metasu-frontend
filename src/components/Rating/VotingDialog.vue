<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { service } from '@/helpers/api'
import { useDisplay } from 'vuetify'
import CloseIcon from '@/assets/icons/Exit.svg'
import Button from '@/components/Button/Button.vue'
import Modal from '@/components/Modal/Modal.vue'
import StarRating1 from '@//assets/icons/StarRating1.svg'
import StarRating2 from '@//assets/icons/StarRating2.svg'
import StarRating3 from '@//assets/icons/StarRating3.svg'
import StarRating4 from '@//assets/icons/StarRating4.svg'
import StarRating5 from '@//assets/icons/StarRating5.svg'

const emit = defineEmits(['rated', 'changed', 'deleted', 'update:open'])

const props = defineProps({
  id: { type: String, default: '' },
  publisherId: { type: String, default: '' },
  title: { type: String, default: '' },
  open: {type: Boolean, default: false },
  edit: {type: Boolean, default: false },
  pComment: {type: String, default: '' },
  pCurrentVote: {type: Number, rate: 0 },
})

const { t } = useI18n()
const { mdAndUp } = useDisplay()

const showDialog = computed({
  get () {
    return props.open
  },
  set (value) {
    return emit('update:open', value)
  }
})

const currentVote = ref(0)
const comment = ref('')
const ratingError = ref(false)
const ratingHover = ref(0)

const bigStarComponents = [
  StarRating1,
  StarRating2,
  StarRating3,
  StarRating4,
  StarRating5
]

const bigVoteComponent = computed(() => {
  switch (currentVote.value) {
  case 5: return StarRating5
  case 4: return StarRating4
  case 3: return StarRating3
  case 2: return StarRating2
  default: return StarRating1
  }
})

const bigVoteHoverComponent = computed(() => {
  switch (ratingHover.value) {
  case 5: return StarRating5
  case 4: return StarRating4
  case 3: return StarRating3
  case 2: return StarRating2
  default: return StarRating1
  }
})

const ratingDetails = ref(false)

watch(() => showDialog.value, (val) => {
  if(val === false) {
    currentVote.value = 0
    comment.value = ''
  }
})

watch(() => ratingDetails.value, (val) => {
  document.querySelector('html').classList.toggle('overflow-hidden', val)
} )

watchEffect(() => {
  comment.value = props.pComment
  currentVote.value = props.pCurrentVote
})

const rate = async () => {
  if (!currentVote.value) {
    ratingError.value = true
    return
  }
  try {
    await service.post('/ratings',
      {
        publisherId: props.publisherId,
        itemId: props.id,
        rating: currentVote.value,
        text: comment.value
      }
    )
    emit('rated')
  } catch(e) {
    console.log('error: %o', e)
  }
  showDialog.value = false
}

const change = async () => {
  if (!currentVote.value) {
    ratingError.value = true
    return
  }
  try {
    await service.put('/ratings',
      {
        id: props.id,
        rating: currentVote.value,
        text: comment.value
      }
    )
    emit('changed')
  } catch(e) {
    console.log('error: %o', e)
  }
  showDialog.value = false
}

const remove = async () => {
  if (!currentVote.value) {
    ratingError.value = true
    return
  }
  try {
    await service.delete(`/ratings/${props.id}`)
    emit('deleted')
  } catch(e) {
    console.log('error: %o', e)
  }
  showDialog.value = false
}
</script>

<template>
  <Modal
    v-model="showDialog"
    @update:modelValue="() => showDialog = false"
    scrollable
    :fullscreen="false"
    width="800px"
  >
    <div class="voting-dialog color-black">
      <div class="flex justify-space-between justify-md-end">
        <div class="d-block d-md-none header-sm-1">
          {{  edit ? $t('rating.voting.editHeader') : $t('rating.voting.header') }}
        </div>
        <button
          class="link ml-6"
          @click="() => showDialog = false"
          type="button"
        >
          <CloseIcon class="link black-icon" @click="() => showDialog = false" aria-hidden="true"/>
          <span class="sr-only">{{ $t('modal.close') }}</span>
        </button>
      </div>
      <div class="text-center mt-2 mt-md-6">
        <div class="header-4 d-none d-md-block">
          {{  edit ? $t('rating.voting.editHeader') : $t('rating.voting.header') }}
        </div>
        <div class="voting-dialog-title mt-2 header-md-8 header-sm-7">
          {{  edit ? $t('rating.voting.editSubheader') : $t('rating.voting.subheader') }}
          <span class="color-primary-100">{{ title }}</span>
        </div>
        <div class="voting-dialog-stars">
          <div
            class="d-inline-block link star-block" role="radiogroup" aria-required="true"
            v-for="rating in 5"
            :key="rating"
            @mouseenter= "() => ratingHover = rating"
            @mouseout = "() => ratingHover = 0"
          >
            <label v-if="ratingHover === 0" :for="`rating_${rating}_of_5`">
              <!-- NORMAL DISPLAY -->
              <button
                role="radio"
                type="button"
                :aria-checked="currentVote === rating"
                @click.prevent="currentVote = rating">
                <component
                  v-if="currentVote !== 0 && currentVote > rating"
                  :is="bigVoteComponent"
                  :class="`big-star-${currentVote}`"
                  :height="mdAndUp ? 96 : 56"
                  :width="mdAndUp ? 96 : 56"
                />
                <component
                  v-else
                  :is="bigStarComponents[rating-1]"
                  class="big-star-1"
                  :class="`big-star-${rating} ${currentVote !== rating ? 'inactive' : ''}`"
                  :height="mdAndUp ? 96 : 56"
                  :width="mdAndUp ? 96 : 56"
                />
                <span class="sr-only">
                  {{  $t(`rating.labels.rate${rating}of5`) }}
                </span>
              </button>
            </label>
            <!-- HOVER -->
            <template v-else>
              <button type="button" @click.prevent="currentVote = rating">
                <component
                  v-if="ratingHover > rating"
                  :is="bigVoteHoverComponent"
                  :class="`big-star-${ratingHover}`"
                  :height="mdAndUp ? 96 : 56"
                  :width="mdAndUp ? 96 : 56"
                />
                <component
                  v-else
                  :is="bigStarComponents[rating-1]"
                  :class="`big-star-${rating} ${ratingHover !== rating ? 'inactive' : ''}`"
                  class="big-star-1"
                  :height="mdAndUp ? 96 : 56"
                  :width="mdAndUp ? 96 : 56"
                />
              </button>
            </template>
            <input :id="`rating_${rating}_of_5`" class="sr-only" type="radio"
              name="rating"
              v-model="currentVote" tabindex="-1"
              :value="rating"
            />
          </div>
        </div>
        <div
          v-if="ratingError" role="alert" aria-live="polite"
          class="voting-error color-error header-md-9 font-type-sm-b1"
        >
          {{ $t('rating.emptyRatingError') }}
        </div>
        <div class="voting-dialog-comment mt-6">
          <div class="form-input form-search">
            <v-textarea
              class="textarea"
              :label="t('rating.voting.addComment')"
              :placeholder="t('rating.voting.commentPlaceholder')"
              v-model="comment"
              variant="underlined"
              auto-grow
              rows="1"
              row-height="20"
              maxlength="1000"
              persistent-placeholder
              hide-details
            />
          </div>
        </div>
        <div
          class="mt-6 mt-md-12 d-flex justify-center buttons"
          :class="edit ? 'buttons-two' : 'buttons-one'"
        >
          <template v-if="edit">
            <Button
              variant="black"
              @click="change"
            >
              {{ $t('rating.voting.save') }}
            </Button>
            <Button
              variant="white"
              @click="remove"
            >
              {{ $t('rating.voting.delete') }}
            </Button>
          </template>
          <Button
            v-else
            variant="black"
            @click="rate"
          >
            {{ $t('rating.voting.rate') }}
          </Button>
        </div>
      </div>
    </div>
  </Modal>
</template>

<style lang="scss" scoped>
  .voting-dialog {
    background-color: white;
    padding: 30px 24px 48px 24px;
    overflow-x: auto;

    &-stars {
      margin-top: 30px;
    }
  }
  .star-block {
    width: 96px;
    height: 96px;
    svg {
      pointer-events: none;
    }
  }
  .buttons {
    &.buttons-two {
      gap: 48px;
      flex-direction: row;
    }
  }

  @media (max-width: $MAX-WIDTH-MOBILE) {
    .voting-dialog  {
      padding: 24px;

      &-title {
        text-align: left;
      }
      &-stars {
        margin-top: 24px;
      }
      .buttons {
        &.buttons-two {
          flex-direction: column;
        }
        gap: 16px;
      }
    }

    .star-block {
      width: 56px;
      height: 56px;
    }
  }
</style>