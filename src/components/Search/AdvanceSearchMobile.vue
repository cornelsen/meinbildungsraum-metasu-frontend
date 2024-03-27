<script setup>
import { ref, computed, watch, watchEffect, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import Select from '@/components/Forms/Select.vue'
import InputText from '@/components/Forms/InputText.vue'
import Button from '@/components/Button/Button.vue'
import InputButton from '@/components/Button/InputButton.vue'
import SearchIcon from '@/assets/icons/Search.svg'
import CloseIcon from '@/assets/icons/Exit.svg'
import Modal from '@/components/Modal/Modal.vue'
import { mapSearchModelsToQueries } from '@/components/Search/commons/Search.helper'
import { useRoute, useRouter } from 'vue-router'
import { getLastUsedSubjects } from '@/stores/lastVisited'


const props = defineProps({
  loading: { type: Boolean, default: false },
  formItems: {type: Object, default: () => {}},
  modelValue: {type: Object, default: () => {}},
  subjectRequiredError: { type: Boolean, default: false }
})

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const defaultPlaceholder = computed(() => t('search.adv.start'))
const selectedOptions = ref(defaultPlaceholder.value)
watch(props.modelValue, () => {
  mapSearchModelsToQueries(router, route, props.modelValue)
})

const emit = defineEmits(['search', 'update:modelValue'])
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

const focusOnRow = ref([false, false, false])

const activeRows = computed(() => {
  return [
    focusOnRow.value[0] || model.value.subject.length || model.value.schoolType.length || model.value.studyYear.length,
    focusOnRow.value[1] || model.value.search.length,
    focusOnRow.value[2] || model.value.mediaType.length || model.value.learningResourceType.length
  ]
})

const search = async () => {
  emit('search')
  nextTick(() => {
    if (!props.subjectRequiredError) {
      searchMenuShow.value = false
    } else {
      document.querySelector('.search-menu')?.scroll(0, 0)
    }
  })
}

const clearFormData = () => {
  model.value.subject = []
  model.value.mediaType = []
  model.value.learningResourceType = []
  model.value.schoolType = []
  model.value.studyYear = []
  model.value.search = ''
}

const isSearchDisabled = computed(() => {
  return props.loading
})

const mapValuesToLabel = (type) => {
  return model.value[type].map(el => {
    return (props.formItems[type].find(elRaw => {
      return elRaw.key === el
    }) || {}).label || undefined
  }).filter(el => el)
}

watchEffect(() => {
  const placeHolders =
    mapValuesToLabel('subject').concat(
      mapValuesToLabel('schoolType').concat(
        mapValuesToLabel('studyYear').concat(
          [model.value.search].concat(
            mapValuesToLabel('mediaType').concat(
              mapValuesToLabel('learningResourceType')
            )
          )
        )
      )
    ).filter(el => el)
  selectedOptions.value = placeHolders.join(' / ')
})
const searchMenuShow = ref(false)
</script>

<template>
  <div class="container">
    <div class="search-button">
      <div>
        <div class="header-5 color-black">{{ $t('search.header') }}</div>
        <div class="font-type-b2 color-grey-4">{{ $t('search.tip') }}</div>
      </div>

      <InputButton
        class="mt-2"
        :active="selectedOptions ? true : false"
        @click="() => searchMenuShow = true"
        :text="selectedOptions || defaultPlaceholder"
      >
        <SearchIcon aria-hidden="true" @click.stop="search"/>
      </InputButton>
      <Modal
        v-model="searchMenuShow"
        fullscreen
        scrollable
        :scrim="false"
        transition="dialog-top-transition"
      >
        <div class="search-menu color-black">
          <v-form  @submit.prevent="search">
            <div class="search-menu-toolbar d-flex justify-space-between align-center">
              <div class="header-sm-2">
                {{ $t('search.adv.title') }}
              </div>
              <div>
                <button type="button" class="link" @click="searchMenuShow = false">
                  <CloseIcon class="link black-icon" aria-hidden="true"/>
                  <span class="sr-only">{{ $t('modal.close') }}</span>
                </button>
              </div>
            </div>
            <!-- 1 -->
            <div class="search-menu-content">
              <div class="number" :class="{ 'active': activeRows[0] }">1</div>
              <div>
                <Select
                  :label="$t('search.subject')"
                  :placeholder="$t('search.subjectPlaceholder')"
                  :loading="loading"
                  :items="formItems.subject"
                  v-model="model.subject"
                  :lastUsed="lastUsedSubjects"
                  :error="subjectRequiredError"
                  :error-messages="subjectRequiredError ? $t('search.subjectRequired') : ''"
                  @is:focused="(val) => focusOnRow[0] = val"
                  multiple
                />
                <Select
                  class="mt-6"
                  :label="$t('search.adv.schoolType')"
                  :loading="loading"
                  :placeholder="$t('search.adv.schoolTypePlaceholder')"
                  :items="formItems.schoolType"
                  @is:focused="(val) => focusOnRow[0] = val"
                  v-model="model.schoolType"
                />
                <Select
                  class="mt-6"
                  :label="$t('search.adv.studyYear')"
                  :loading="loading"
                  :placeholder="$t('search.adv.studyYearPlaceholder')"
                  :items="formItems.studyYear"
                  @is:focused="(val) => focusOnRow[0] = val"
                  v-model="model.studyYear"
                />
              </div>
            </div>
            <!-- 2 -->
            <div class="search-menu-content mt-10">
              <div class="number" :class="{ 'active': activeRows[1] }">2</div>
              <div>
                <input-text
                  :label="$t('search.adv.keywords')"
                  :placeholder="$t('search.searchPlaceholder')"
                  v-model="model.search"
                  persistent-placeholder
                  :append-inner-icon="SearchIcon"
                  @focus="focusOnRow[1] = true"
                  @blur="focusOnRow[1] = false"
                />
              </div>
            </div>
            <!-- 3 -->
            <div class="search-menu-content mt-10">
              <div class="number" :class="{ 'active': activeRows[2] }">3</div>
              <div>
                <Select
                  :label="$t('search.adv.mediaType')"
                  :placeholder="$t('search.adv.mediaTypePlaceholder')"
                  :loading="loading"
                  :items="formItems.mediaType"
                  @is:focused="(val) => focusOnRow[2] = val"
                  v-model="model.mediaType"
                  multiple
                />
                <Select
                  class="mt-6"
                  :label="$t('search.adv.typeOfMaterial')"
                  :placeholder="$t('search.adv.typeOfMaterialPlaceholder')"
                  :loading="loading"
                  :items="formItems.learningResourceType"
                  @is:focused="(val) => focusOnRow[2] = val"
                  v-model="model.learningResourceType"
                />
              </div>
            </div>
            <!-- BUTTONS -->
            <div class="search-buttons mt-6">
              <div class="search-buttons-container">
                <div class="button">
                  <Button
                    @click="clearFormData"
                    :text="$t('search.clean')"
                    variant="white"
                  />
                </div>
                <div class="button">
                  <Button
                    type="submit"
                    :text="$t('search.showResults')"
                    variant="black"
                    :disabled="isSearchDisabled"
                  />
                </div>
              </div>
            </div>
          </v-form>
        </div>
      </Modal>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .container {
    width: 100%;
    overflow: auto;
  }
  .search-button {
    margin: 16px 16px 0 16px;
    padding: 20px;
    background-color: #fff;
  }

  .search-menu {
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
      background-color: $color-grey-6;
      padding: 64px 16px 16px 16px;
    }
    &-content {
      background-color: #fff;
      margin: 32px 16px 0 16px;
      padding: 20px 16px;

      .number {
        width: 40px;
        height: 40px;
        padding: 8px;
        position: relative;
        margin-top: -40px;
        text-align: center;
        font-size: 24px;
        line-height: 24px;
        font-weight: 400px;
        color: $color-primary-50;
        background-color: #FFF;

        &.active {
          color: $color-primary-80;
        }
      }
    }

    .search-buttons {
      position: sticky;
      padding: 24px;
      bottom: 0;
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
