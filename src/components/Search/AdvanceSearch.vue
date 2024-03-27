<script setup>
import { computed, watch } from 'vue'
import ArrowRightIcon from '@/assets/icons/Side=Right.svg'
import AdvanceSearchPC from '@/components/Search/AdvanceSearchPC.vue'
import AdvanceSearchMobile from '@/components/Search/AdvanceSearchMobile.vue'
import { mapSearchModelsToQueries } from '@/components/Search/commons/Search.helper'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'

const props = defineProps({
  loading: { type: Boolean, default: false },
  formItems: {type: Object, default: () => {}},
  modelValue: {type: Object, default: () => {}},
  subjectRequiredError: { type: Boolean, default: false }
})

const route = useRoute()
const router = useRouter()
const { mdAndUp } = useDisplay()

watch(props.modelValue, () => mapSearchModelsToQueries(router, route, props.modelValue))

const emit = defineEmits(['changeSearch', 'search', 'update:modelValue'])
const model = computed({
  get () {
    return props.modelValue
  },
  set (value) {
    return emit('update:modelValue', value)
  }
})

const changeSearch = () => {
  emit('changeSearch', 'advSearch')
}

const search = async () => {
  emit('search')
}
</script>

<template>
  <div class="container">
    <AdvanceSearchPC
      v-if="mdAndUp"
      :loading="loading"
      :formItems="formItems"
      v-model="model"
      :subjectRequiredError="subjectRequiredError"
      @search="search"
    />
    <AdvanceSearchMobile
      v-else
      :loading="loading"
      :formItems="formItems"
      v-model="model"
      :subjectRequiredError="subjectRequiredError"
      @search="search"

    />

    <div class="switch-search | justify-center justify-md-end">
      <button
        type="button"
        class="switch-search-link link outline-w font-button uppercase"
         @click.prevent="changeSearch"
        >
        {{ $t('search.adv.goToStdSearch') }}
        <ArrowRightIcon
          :width="mdAndUp ? 32 : 24"
          :height="mdAndUp ? 32 : 24"
          class="link-arrow white-icon"
          aria-hidden="true"
        />
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .container {
    width: 100%;
    overflow: auto;
  }
  .switch-search {
    display: flex;
    flex-direction: row;
    margin-top: 32px;
    margin-right: 48px;
    margin-bottom: 68px;

    &-link {
      display: flex;
      flex-direction: row;
      align-items: center;

      &:hover .link-arrow {
        transform: translateX(12px);
      }
      .link-arrow {
        transition: transform .3s ease-out;
        margin-left: 16px;
      }
    }
  }

  @media (max-width: $MAX-WIDTH-MOBILE) {
    .switch-search {
      margin: 16px 0;
    }
  }
</style>
