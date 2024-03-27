<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Select from '@/components/Forms/Select.vue'
import InputText from '@/components/Forms/InputText.vue'
import Button from '@/components/Button/Button.vue'
import SearchIcon from '@/assets/icons/Search.svg'
import { getLastUsedSubjects } from '@/stores/lastVisited'

const props = defineProps({
  loading: { type: Boolean, default: false },
  formItems: {type: Object, default: () => {}},
  modelValue: {type: Object, default: () => {}},
  subjectRequiredError: { type: Boolean, default: false }
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
const { t } = useI18n()

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

</script>

<template>
  <div class="container">
    <v-form class="search-form" @submit.prevent="search">
      <div>
        <span class="header-7 color-black">{{ $t('search.header') }}</span>
        <span class="divider"></span>
        <span class="font-type-b4 color-grey-4">{{ $t('search.tip') }}
        </span>
      </div>
      <!-- ROW 1 -->
      <div class="flex form-container first-row">
        <div class="step-number" :class="{ 'active': activeRows[0] }"><div>1</div></div>
        <div class="form-input">
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
        </div>
        <div class="form-input">
          <Select
            :label="$t('search.adv.schoolType')"
            :loading="loading"
            :placeholder="$t('search.adv.schoolTypePlaceholder')"
            :items="formItems.schoolType"
            @is:focused="(val) => focusOnRow[0] = val"
            v-model="model.schoolType"
          />
        </div>
        <div class="form-input">
          <Select
            :label="$t('search.adv.studyYear')"
            :loading="loading"
            :placeholder="$t('search.adv.studyYearPlaceholder')"
            :items="formItems.studyYear"
            @is:focused="(val) => focusOnRow[0] = val"
            v-model="model.studyYear"
          />
        </div>
      </div>
      <!-- ROW 2 -->
      <div class="flex form-container">
        <div class="step-number" :class="{ 'active': activeRows[1] }">2</div>
        <div class="form-input form-search">

          <input-text
            :label="$t('search.adv.keywords')"
            :placeholder="$t('search.searchPlaceholder')"
            v-model="model.search"
            :append-inner-icon="SearchIcon"
            persistent-placeholder
            @focus="focusOnRow[1] = true"
            @blur="focusOnRow[1] = false"
          />
        </div>
      </div>
      <!-- ROW 3 -->
      <div class="flex form-container">
        <div class="step-number"  :class="{ 'active': activeRows[2] }">3</div>
        <div class="form-input form-media-type">
          <Select
            :label="$t('search.adv.mediaType')"
            :placeholder="$t('search.adv.mediaTypePlaceholder')"
            :loading="loading"
            :items="formItems.mediaType"
            @is:focused="(val) => focusOnRow[2] = val"
            v-model="model.mediaType"
            multiple
          />
        </div>
        <div class="form-input type-of-material">
          <Select
            :label="$t('search.adv.typeOfMaterial')"
            :placeholder="$t('search.adv.typeOfMaterialPlaceholder')"
            :loading="loading"
            :items="formItems.learningResourceType"
            @is:focused="(val) => focusOnRow[2] = val"
            v-model="model.learningResourceType"
          />
        </div>
        <div class="form-buttons">
          <Button
            @click="clearFormData"
            :text="$t('search.clean')"
            class="mr-8"
            variant="white"
          />
          <Button
            type="submit"
            :text="$t('search.showResults')"
            variant="black"
            :disabled="isSearchDisabled"
          />
        </div>
      </div>
    </v-form>
  </div>
</template>

<style lang="scss" scoped>
  .container {
    width: 100%;
    overflow: auto;
  }
  .search-form {
    margin: 68px 48px 0 48px;
    padding: 48px;
    background-color: #fff;

    .form-container {
      flex-direction: row;
      justify-content: stretch;
      &.first-row {
        margin-top: 32px;
        .form-input {
          align-self: start;
        }
      }
      .step-number {
        font-size: 64px;
        font-weight: $font-weight-extra-light;
        line-height: 104px;
        color: $color-grey-5;
        flex: 0 0 37px;
        transition: all .2s linear;
        &.active {
          transition: all .2s linear;
          font-weight: $font-weight-normal;
          color: $color-black;
        }
      }
      .form-input {
        padding-left: 48px;
        width: 33%;
        align-self: center;
      }

      .form-search {
        width: 100%;
      }
      .form-media-type {
        width: 25%;
      }
      .type-of-material {
        width: 30%;
      }
      .form-buttons {
        flex: 45% 1 1;
        align-self: center;
        padding-left: 48px;
        margin-top: 22px;
        display: flex;
        justify-content: flex-end;
      }
    }
  }
</style>
