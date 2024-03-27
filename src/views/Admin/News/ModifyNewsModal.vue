<script setup>
import { ref, computed, watchEffect, nextTick} from 'vue'
import { useI18n } from 'vue-i18n'
import { service} from '@/helpers/api'
import Button from '@/components/Button/Button.vue'
import Loader from '@/components/Loader/Loader.vue'
import Modal from '@/components/Modal/Modal.vue'
import CloseIcon from '@/assets/icons/Exit.svg'
import Editor from '@/components/Editor/Editor.vue'
import Tabs from '@/components/Tabs/Tabs.vue'

const MODES = {
  'NEW': 'NEW',
  'EDIT': 'EDIT'
}

const emit = defineEmits(['added', 'edited', 'error', 'update:modelValue'])
const props = defineProps({
  pNews: { type: Object, default: () => null },
  modelValue: { type: Boolean, default: false },
  mode: { type: String, default: 'NEW' }
})
const { t } = useI18n()

const editorRefEn = ref(null)
const editorRefDe = ref(null)
const contentDe = ref({})
const contentEn = ref({})

const dialogOpen = computed({
  get () {
    return props.modelValue
  },
  set (value) {
    return emit('update:modelValue', value)
  }
})

const formRef = ref()
const saving = ref(false)
const news = ref({})

watchEffect(() => {
  if (props.mode === MODES.NEW && dialogOpen.value) {
    news.value = {
      id: '',
      titleEn: null,
      titleDe: null,
      contentEn: '',
      contentDe: ''
    }
    contentDe.value = null
    contentEn.value = null
  } else {
    news.value = { ... props.pNews }
    contentDe.value = props.pNews?.contentDe
    contentEn.value = props.pNews?.contentEn
  }
})

const closeDialog = () => {
  dialogOpen.value = false
}

const validation = {
  required: value => !!value || t('validations.required'),
}

const addNews = async () => {
  const isInvalid = (await formRef.value.validate()).valid === false
  if (isInvalid) {
    if (news.value.titleEn === null) news.value.titleEn = ''
    if (news.value.titleDe === null) news.value.titleDe = ''
    return
  }
  saving.value = true
  try {
    await service.post('/news', {
      titleEn: news.value.titleEn,
      titleDe: news.value.titleDe,
      contentEn: contentEn.value,
      contentDe: contentDe.value
    })
    emit('added')
  } catch (e) {
    emit('error')
    console.log('error %o', e)
  }
  saving.value = false
  closeDialog()
}

const saveNews = async () => {
  const isInvalid = (await formRef.value.validate()).valid === false
  if (isInvalid) {
    if (news.value.titleEn === null) news.value.titleEn = ''
    if (news.value.titleDe === null) news.value.titleDe = ''
    return
  }
  saving.value = true
  try {
    await service.put('/news', {
      id: news.value.id,
      titleEn: news.value.titleEn,
      titleDe: news.value.titleDe,
      contentEn: contentEn.value,
      contentDe: contentDe.value
    })
    emit('edited', { ...news.value })
  } catch (e) {
    emit('error')
    console.log('error %o', e)
  }
  saving.value = false
  closeDialog()
}

const tabs = computed(() => {
  return [
    { name: t('admin.news.labels.titleDe'), key: 'german', error: news.value.titleDe === '' },
    { name: t('admin.news.labels.titleEn'), key: 'english', error: news.value.titleEn === '' }
  ]
})

const changeTab = async () => {
  nextTick(() => {
    if (news.value.titleEn === null) news.value.titleEn = ''
    if (news.value.titleDe === null) news.value.titleDe = ''
    formRef.value.validate()
  })
}

</script>

<template>
  <div>
    <Modal
      v-model="dialogOpen"
      @update:modelValue="closeDialog"
      persistent
      scrollable
      width="800"
    >
      <div class="edit-dialog">
        <div class="flex justify-end edit-dialog-toolbar">
          <div
            class="d-flex d-md-none header-sm-2 w-100"
          >
            {{
              mode === MODES.NEW
              ? $t('admin.news.addNews')
              : $t('admin.news.editNews')
            }}
          </div>
          <button
            class="link"
            @click="closeDialog"
            type="button"
          >
            <CloseIcon class="link black-icon" aria-hidden="true"/>
            <span class="sr-only">{{ $t('modal.close') }}</span>
          </button>
        </div>

        <v-form ref="formRef" @submit.prevent="() => mode === MODES.NEW ? addNews() : saveNews()">
          <div class="edit-dialog-content flex flex-column">
            <Tabs
              @tab:change="changeTab" mb="mb-2"
              :tabs="tabs" class="mt-0 mt-md-12 mb-5 w-100 px-0 px-md-6"
              ref="tabComp"
              fullWidth
            >
              <template #validation>
                <div class="flex w-100 error-message mb-5 font-body-b6">
                  <div class="w-50 text-center">{{  news.titleDe === '' ? 'German version is required' : '&nbsp;' }}</div>
                  <div class="w-50 text-center">{{  news.titleEn === ''?  'English version is required' : '&nbsp;' }}</div>
                </div>
              </template>
              <template #german>
                <v-text-field
                  :label="$t('admin.news.labels.title')"
                  class="input mt-2"
                  v-model="news.titleDe"
                  variant="underlined"
                  density="default"
                  persistent-placeholder
                  :rules="[validation.required]"
                />
                <v-text-field type="hidden" class="d-none" v-model="news.titleEn" :rules="[validation.required]"/>
                <Editor ref="editorRefDe" v-model="contentDe" class="mt-5"/>
              </template>
              <template #english>
                <v-text-field
                  :label="$t('admin.news.labels.title')"
                  class="input"
                  v-model="news.titleEn"
                  variant="underlined"
                  density="default"
                  persistent-placeholder
                  :rules="[validation.required]"
                />
                <v-text-field type="hidden" class="d-none" v-model="news.titleDe" :rules="[validation.required]"/>
              <Editor ref="editorRefEn" v-model="contentEn" class="mt-5"/>
              </template>
            </Tabs>

            <Loader v-if="saving" class="pb-6 pt-6 pl-6 pr-6" />
          </div>
          <div
              class="modal-buttons mt-6 mt-md-0"
            >
              <div class="modal-buttons-container">
                <div class="button">
                  <Button
                    type="submit"
                    :text="mode === MODES.NEW ? $t('admin.news.form.add') : $t('admin.news.form.save')"
                    variant="black"
                  />
                </div>
                <div class="button">
                  <Button
                    type="button"
                    @click="closeDialog"
                    :text="$t('admin.news.form.cancel')"
                    variant="white"
                  />
                </div>
              </div>
            </div>
        </v-form>
      </div>
    </Modal>
  </div>
</template>

<style lang="scss" scoped>
  .edit-dialog {
    background-color: #FFF;
    color: $color-black;
    overflow-y: scroll;
    &-toolbar {
      display: flex;
      top: 0;
      background-color: #fff;
      z-index: 6;
      padding: 24px 24px;
      position: sticky;
      box-shadow: 0px 0px 40px 0px #0000001A;
    }

    &-content {
      padding: 24px;
      gap: 48px;
      overflow-y: scroll;
    }

    .modal-buttons {
      position: sticky;
      z-index: 1;
      padding: 24px;
      bottom: 0;
      background-color: #FFF;
      box-shadow: 0px 0px 40px 0px #0000001A;

      &-container {
        display: flex;
        justify-content: flex-end;
        gap: 32px;
      }
    }

    .error-message {
      color: $color-error;
    }
  }

  .green {
    color: $color-success;
  }
  .red {
    color: $color-error;
  }


  @media (max-width: $MAX-WIDTH-MOBILE) {
    .edit-dialog {
      height: 100%;
      width: 100%;
      background-color: $color-grey-6;

      &-toolbar {
        z-index: 6;
        box-shadow: none;
        background-color: $color-grey-6;
        padding: 64px 16px 16px 16px;
        margin-top: 0;
      }

      &-content {
        margin: 32px 16px;
        padding: 20px 16px;
        background-color: #FFF;
        gap: 24px;
      }

      .modal-buttons {
        padding: 24px;
        background-color: #FFF;

        &-container {
          display: flex;
          gap: 8px;

          .button {
            width: 50%;
          }
          .separator {
            width: 8px;
          }
        }
      }
    }
  }
</style>
