<script setup>
import { useI18n } from 'vue-i18n'
import { ref, reactive, watch, computed } from 'vue'
import { useDisplay } from 'vuetify'
import { scrollTo } from '@/helpers/ui'
import { service } from '@/helpers/api'
import { mapRawSearchData } from '@/components/Search/commons/Search.helper'
import Modal from '@/components/Modal/Modal.vue'
import Pagination from '@/components/Pagination/Pagination.vue'
import ResultGrid from '@/components/Search/Results/ResultGrid.vue'
import Select from '@/components/Forms/Select.vue'
import Button from '@/components/Button/Button.vue'
import Loader from '@/components/Loader/Loader.vue'

import ArrowLeftIcon from '@/assets/icons/Side=Left.svg'
import SearchIcon from '@/assets/icons/Search.svg'
import SortIcon from '@/assets/icons/Sort.svg'

const { t } = useI18n()
const { mdAndUp } = useDisplay()
const favs = ref([])
const fetchingResults = ref(false)
const error = ref(false)
const totalElements = ref(0)
const sortByModalShow = ref(false)
const MAX_PAGE_SIZE = 20
const formData = reactive({
  search: '',
  sortType: ['name-asc'],
  page: 1
})

const sortBy = computed(() => ([
  { key: 'name-asc', label: t('search.filters.sortTypes.alphabetic') },
  { key: 'relevance-desc', label: t('search.filters.sortTypes.mostViewed') },
  { key: 'publishDate-desc', label: t('search.filters.sortTypes.newest') },
  { key: 'publishDate-asc', label: t('search.filters.sortTypes.oldest') }
]))

watch(() => formData.search, () => {
  debounceSearch()
})

watch(() => formData.sortType, () => {
  doNewSearch()
})

watch(() => formData.page, () => {
  doSearch()
})

const doSearch = async (disableScroll) => {
  clearTimeout(searchDebounceTimer)
  fetchingResults.value = true
  error.value = false
  try {
    const sortType = formData.sortType[0].split('-')
    const { data } = await service.get('/favorites/own',
      {
        params: {
          page: formData.page - 1,
          size: MAX_PAGE_SIZE,
          sort: [
            sortType[0], sortType[1]
          ],
          search: formData.search
        }
      }
    )
    totalElements.value = data.totalElements
    favs.value = mapRawSearchData(data.content)
  } catch (e) {
    error.value = true
    console.log('error %o', e)
  }
  if (!disableScroll) {
    scrollTo('.progress-bar', !mdAndUp.value)
  }
  fetchingResults.value = false
}

let searchDebounceTimer

const debounceSearch = () => {
  if(searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
  searchDebounceTimer = setTimeout(() => {
    doNewSearch()
  }, 1000)
}

const doNewSearch = async () => {
  formData.page = 1
  await doSearch()
}

doSearch(true)

</script>

<template>
<!-- MOBILE SORT -->
<Modal
    v-model="sortByModalShow"
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
    <Loader v-if="fetchingResults"/>
    <div v-else class="limited-width pl-md-4 pr-md-4 pl-md-12 pr-md-12 mb-4 mb-md-16 pt-8 w-100">
      <div class="flex justify-space-between flex-column flex-md-row">
        <div class="d-block d-md-flex align-center">
          <h2 class="header-md-6 header-sm-2 color-black">{{ $t('profile.favorites.header') }}</h2>
          <div class="header-md-7 font-type-sm-b2 color-grey-4 ml-0 ml-md-4">
            {{ totalElements }} {{ $t('search.savedResults') }}
          </div>
        </div>
        <div class="mb-4">
          <v-form
            @submit.prevent="doSearch"
            class="form-container d-none d-mb-flex"
          >
            <div class="form-input">
              <v-text-field
                class="input input-search"
                :placeholder="$t('search.searchPlaceholder')"
                :items="[]"
                v-model="formData.search"
                :append-inner-icon="SearchIcon"
                variant="underlined"
                density="default"
                hide-details
                persistent-placeholder
              >
              <template v-slot:prepend>
                <div class="color-black input-label">
                  {{ $t("search.search") }}:
                </div>
              </template>
              </v-text-field>
            </div>
            <div class="sort-by ml-14 d-none d-md-flex">
              <div class="sort-by-label font-type-b5 color-black">
                {{ $t('search.filters.sortBy') }}:
              </div>
              <Select
                class="sort-by-select ml-4"
                :items="sortBy"
                noEmpty
                :aria-label="$t('search.filters.sortBy')"
                v-model="formData.sortType"
              />
            </div>
            <v-btn class="d-none" type="submit"/>
          </v-form>
          <div class="d-block d-md-none mt-4">
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
    <div v-if="!fetchingResults" class="mb-8 mb-md-80">
      <ResultGrid
        :items="favs"
      />
      <div v-if="totalElements > MAX_PAGE_SIZE">
        <Pagination
          class="mt-12 mb-12"
          v-model="formData.page"
          :maxPages="totalElements ? Math.ceil(totalElements / MAX_PAGE_SIZE) : 0"
        />
      </div>
    </div>
  </div>
</template>
<style lang="scss">
.sort-by {
  flex-shrink: 0;
  &-label {
    margin-top: 39px;
  }
  &-select {
    display: inline-block;
    min-width: 184px;
  }
}

.input-search {
  width: 359px;

  .input-label {
    margin-top: 18px;
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

</style>