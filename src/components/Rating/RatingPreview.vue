<script setup>
import { ref, computed } from 'vue'
import StarSemi from '@/assets/icons/Star-semi.svg'
import IconLink from '@/components/IconLink/IconLink.vue'
import { getAuthorizationData } from '@/stores/authorization'

const emit = defineEmits(['openRating', 'openVoteModal'])

const props = defineProps({
  rating: { type: String, defailt: '0.0' },
  rated: { type: Boolean, defailt: false },
  allVotes: { type: Number, default: 0}
})

const fetched = ref(true)
const currentRating = computed(() => parseInt(props.rating) || 0)
const canVote = computed(() => !props.rated && getAuthorizationData().authorized.value)
</script>

<template>
  <div v-if="fetched" class="flex align-center flex-wrap">
    <div class="font-type-b1 mr-2 mt-1">{{ rating || '0.0' }}</div>
    <component
      :is="canVote ? 'a' : 'span'"
      class="stars flex"
      :class="{ 'rated': rated }"
      :href="canVote ? '#' : undefined"
      @click.prevent="() => canVote ? emit('openVoteModal') : false"
    >
      <span v-if="canVote" class="sr-only">{{ $t('rating.previewComponent.srOnly.rate') }}</span>
      <StarSemi
         v-for="val in 5" :key="val"
        class="star-semi pr-1 h-100"
        :class="{'active': currentRating >= val }"
        aria-hidden="true"
      />
  </component>
    <IconLink
      v-if="currentRating > 0"
      class="show-rating mr-0 ml-lg-3 mt-md-3"
      icon="right"
      smallGap
      @click="() => emit('openRating')"
    >
      <span class="sr-only">
        {{  $t('rating.previewComponent.show') }}
      </span>
      <span class="d-none d-md-inline-block">
        {{ allVotes }} {{ $t(`rating.previewComponent.${allVotes === 1 ? 'rating' : 'ratings'}`) }}
      </span>
      <span class="d-inline-block d-md-none font-sm-button">
        ({{ allVotes }})
      </span>
    </IconLink>
  </div>
</template>

<style lang="scss" scoped>
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
  }

  @media (max-width: $MAX-WIDTH-MOBILE) {
    .show-rating {
      margin-bottom: 0;
    }
  }
</style>