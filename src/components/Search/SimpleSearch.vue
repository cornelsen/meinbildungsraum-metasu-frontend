<script setup>
import { computed, watch } from 'vue'
import Button from '@/components/Button/Button.vue'
import Select from '@/components/Forms/Select.vue'
import InputText from '@/components/Forms/InputText.vue'
import SearchIcon from '@/assets/icons/Search.svg'
import ArrowRightIcon from '@/assets/icons/Side=Right.svg'
import { mapSearchModelsToQueries } from '@/components/Search/commons/Search.helper'
import { useRoute, useRouter } from 'vue-router'
import { getLastUsedSubjects } from '@/stores/lastVisited'
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'


const props = defineProps({
  searchInProgress: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  formItems: { type: Object, default: () => {} },
  modelValue: {type: Object, default: () => {} },
  subjectRequiredError: { type: Boolean, default: false }
})

const route = useRoute()
const router = useRouter()
const { locale, t } = useI18n()
const { mdAndUp } = useDisplay()
const model = computed({
  get () {
    return props.modelValue
  },
  set (value) {
    return emit('update:modelValue', value)
  }
})

const mapSubjects = () => {
  getLastUsedSubjects().value.forEach((el) => el.label = t(`search.subjects.${el.key}`))
  return getLastUsedSubjects()
}
const lastUsedSubjects = computed(() => mapSubjects().value)

watch(props.modelValue, () => mapSearchModelsToQueries(router, route, props.modelValue))

const emit = defineEmits(['changeSearch', 'search', 'update:modelValue'])

const changeSearch = () => {
  emit('changeSearch', 'stdSearch')
}

const search = () => {
  emit('search')
}
const isSearchDisabled = computed(() => {
  return props.loading
})
</script>

<template>
  <div>
    <div class="d-block d-md-flex container">
      <div v-if="!searchInProgress" class="welcome-tile">
        <div
          class="welcome-tile-header header-sm-1"
          :class="{ 'header-md-3': locale === 'de','header-md-2' : locale !== 'de' }"
        >
          {{ $t('search.std.header') }}
        </div>
        <div
          class="welcome-tile-text"
          :class="{ 'header-7': locale === 'de','header-5' : locale !== 'de' }"
        >
          {{ $t('search.std.text') }}
        </div>
      </div>
      <v-form class="search-tile" @submit.prevent="search">
        <div>
          <span class="header-7 color-black">{{ $t('search.header') }}</span>
          <div class="flex form-container" :class="{ 'flex-row': searchInProgress && mdAndUp }">
            <div class="form-input color-black">
              <Select
                :label="$t('search.subject')"
                :placeholder="$t('search.subjectPlaceholder')"
                :loading="loading"
                :items="formItems.subject"
                aria-required="true"
                :lastUsed="lastUsedSubjects"
                v-model="model.subject"
                :error="subjectRequiredError"
                :error-messages="subjectRequiredError ? $t('search.subjectRequired') : ''"
                multiple
              />
            </div>
            <div class="form-input">
              <input-text
                :label="$t('search.search')"
                :placeholder="$t('search.searchPlaceholder')"
                v-model="model.search"
                :icon="SearchIcon"
                variant="underlined"
                density="default"
              />
            </div>
            <div class="form-button">
              <Button
                type="submit"
                variant="black"
                :text="$t('search.showResults')"
                :disabled="isSearchDisabled"
              />
            </div>
          </div>
        </div>
      </v-form>
    </div>
    <div class="switch-search | justify-center justify-md-end">
      <div class="d-none d-md-block switch-search-tip font-type-b4">{{ $t('search.tip') }}</div>
      <div class="d-none d-md-block divider"></div>
      <button
        type="button"
        class="switch-search-link link outline-w font-button uppercase"
        @click="changeSearch"
      >
        {{ $t('search.std.goToAdvSearch') }}
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
    margin: 68px 48px 0 48px;
    gap: 48px;
    justify-content: stretch;
  }

  .welcome-tile {
    flex: 1;
    padding: 48px;
    border: 1px solid $color-primary-80;

    &-header {
      color: #FFF;
    }

    &-text {
      margin-top: 68px;
      color: $color-primary-30;
    }
  }
  .search-tile {
    flex: 1;
    padding: 48px;
    background-color: #fff;

    .form-container {
      flex-direction: column;
      justify-content: stretch;
      gap: 48px;
      margin-top: 32px;

      .form-input {
        flex: 1;
      }
      .form-button {
        align-self: flex-end;
      }
    }
  }

  .switch-search {
    margin-top: 32px;
    margin-right: 48px;
    margin-bottom: 68px;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    flex-direction: row;
    align-items: center;

    &-tip {
      color: $color-primary-30;
    }
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
    .container {
      margin: 16px 16px 0 16px;
      gap: 48px;
      justify-content: stretch;
    }

    .welcome-tile {
      padding: 20px;
      margin-bottom: 16px;

      &-text {
        margin-top: 16px;
      }
    }

    .search-tile {
      padding: 16px;

      .form-button {
        width: 100%;
      }
    }

    .switch-search {
      margin: 16px 0;
    }
  }
</style>
