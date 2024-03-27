<script setup>
import { ref, reactive, computed, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'
import { service, uploadAttachment, getAttachmentUrlById } from '@/helpers/api'
import Button from '@/components/Button/Button.vue'
import UploadButton from '@/components/Button/UploadButton.vue'
import Loader from '@/components/Loader/Loader.vue'
import Modal from '@/components/Modal/Modal.vue'
import CloseIcon from '@/assets/icons/Exit.svg'
import MinusIcon from '@/assets/icons/Minus.svg'
import PlusIcon from '@/assets/icons/Plus.svg'
import CroppieLib from 'croppie/croppie'
import Croppie from '@/components/Croppie/Croppie.vue'

const MODES = {
  'NEW': 'NEW',
  'EDIT': 'EDIT'
}

const emit = defineEmits(['added', 'edited', 'error', 'update:modelValue'])
const props = defineProps({
  pArticle: { type: Object, default: () => null },
  modelValue: { type: Boolean, default: false },
  mode: { type: String, default: 'NEW' }
})
const { t } = useI18n()
const { mdAndUp } = useDisplay()
const dialogOpen = computed({
  get () {
    return props.modelValue
  },
  set (value) {
    return emit('update:modelValue', value)
  }
})

const previewImage = ref('')
const formRef = ref()
const saving = ref(false)
const article = ref({})
const zoomer = ref(0)
const uploadButton = ref(null)

const croppieOptions = reactive({
  boundary: { width: 800, height: 500 },
  viewport: { width: 384, height: 384, type: 'square' },
  showZoomer: false
})

const defaultCroppieParams = {
  points: [ 0, 0, croppieOptions.viewport.width, croppieOptions.viewport.height ],
  zoom: 1,
  orientation: 1
}

const croppyParams = ref({})

const closeDialog = () => {
  dialogOpen.value = false
}

const validation = {
  required: value => {
    if (value?.length === 0) return t('validations.required')
    return !!value || t('validations.required')
  },
  url: value => {
    let url
    try {
      url = new URL(value)
    } catch (e) {
      return t('validations.url')
    }
    if (!url.host) {
      return t('validations.url')
    }
    return true
  }
}

const addArticle = async () => {
  const isInvalid = (await formRef.value.validate()).valid === false
  uploadButton.value.validate(article.value.croppyImageId)
  if (isInvalid || !article.value.croppyImageId) {
    return
  }
  saving.value = true
  try {
    await service.post('/articles', {
      title: article.value.title,
      originImageId: article.value.originImageId,
      contentUrl: article.value.contentUrl,
      croppyParams: JSON.stringify(croppyParams.value),
      croppyImageId: article.value.croppyImageId
    })
    emit('added')
  } catch (e) {
    emit('error')
    console.log('error %o', e)
  }
  saving.value = false
  closeDialog()
}

const saveArticle = async () => {
  const isInvalid = (await formRef.value.validate()).valid === false
  uploadButton.value.validate(article.value.croppyImageId)
  if (isInvalid || !article.value.croppyImageId) {
    return
  }
  saving.value = true
  try {
    await service.put('/articles', {
      id: article.value.id,
      title: article.value.title,
      originImageId: article.value.originImageId,
      contentUrl: article.value.contentUrl,
      croppyParams: JSON.stringify(croppyParams.value),
      croppyImageId: article.value.croppyImageId
    })
    emit('edited', { ...article.value })
  } catch (e) {
    emit('error')
    console.log('error %o', e)
  }
  saving.value = false
  closeDialog()
}

const modalMode = ref('normal')
const croppieRef = ref(null)

const applyPreviewImage = async () => {
  modalMode.value = 'croppie'
  await croppieRef.value.crop.bind({
    url: previewImage.value,
    ...croppyParams.value,
  })
  zoomer.value = croppyParams.value.zoom
}

const saveCroppedImage = async () => {
  croppyParams.value = JSON.parse(JSON.stringify(croppieRef.value.crop.get()))
  try {
    const file = await croppieRef.value.crop.result({type: 'blob'})
    const id = await uploadAttachment(file)
    article.value.croppyImageId = id
  } catch (e) {
    console.log('error %o', e)
  }
  modalMode.value = 'normal'
}

const editImage = () => {
  applyPreviewImage()
}

const removeImage = () => {
  previewImage.value = ''
  article.value.originImageId = undefined
  article.value.croppyImageId = undefined
}

const uploadedAttachment = async (id) => {
  if (!id) return

  croppyParams.value = JSON.parse(JSON.stringify(defaultCroppieParams))

  const fakeCroppie = new CroppieLib(
    document.querySelector('.croppie-fake'),
    croppieOptions
  )

  try {
    await fakeCroppie.bind({
      url: getAttachmentUrlById(id),
      ...JSON.parse(JSON.stringify(defaultCroppieParams)),
    })
    const file = await fakeCroppie.result({type: 'blob'})
    const newId = await uploadAttachment(file)
    article.value.originImageId = id
    article.value.croppyImageId = newId
    previewImage.value = getAttachmentUrlById(id)
  } catch (e) {
    console.log('error %o', e)
  }
  fakeCroppie.destroy()
}

watch(zoomer, () => {
  croppieRef.value.crop.setZoom(zoomer.value)
})

watch(dialogOpen, (val) => {
  if (val) {
    previewImage.value = ''
    if (props.mode === MODES.NEW) {
      article.value = {
        id: '',
        title: '',
        originImageId: '',
        croppyImageId: '',
        contentUrl: '',
      }
      croppyParams.value = JSON.parse(JSON.stringify(defaultCroppieParams))
    } else {
      article.value = { ... props.pArticle }
      try {
        croppyParams.value = JSON.parse(article.value.croppyParams)
      } catch (e) {
        console.log(e)
        croppyParams.value = JSON.parse(JSON.stringify(defaultCroppieParams))
      }
      previewImage.value = getAttachmentUrlById(article.value.originImageId)
    }
  }
})

watch(modalMode, (val) => {
  if (val === 'croppie') {
    nextTick(() => {
      const croppieContainer = document.querySelector('.cr-viewport')
      croppieContainer?.scrollIntoView({ block: 'center' })
    })
  }
})

const photoPlaceholderUrl = `${window.origin}/PlaceholderPhoto.png`
</script>

<template>
  <div>
    <Modal
      v-model="dialogOpen"
      @update:modelValue="closeDialog"
      persistent
      scrollable
      width="858"
    >
      <div class="edit-dialog">
        <div class="flex justify-end edit-dialog-toolbar">
          <div
            v-if="modalMode === 'croppie'"
            class="flex w-100 font-type-md-b1 header-sm-2"
          >
            {{ $t('admin.articles.dragTitle') }}
          </div>
          <div
            v-else
            class="d-flex d-md-none header-sm-2 w-100"
          >
            {{
              mode === MODES.NEW
              ? $t('admin.articles.addArticle')
              : $t('admin.articles.editArticle')
            }}
          </div>
          <button
            class="link"
            @click="modalMode === 'croppie' ? modalMode = 'normal' : closeDialog()"
            type="button"
          >
            <CloseIcon class="link black-icon" aria-hidden="true"/>
            <span class="sr-only">{{ $t('modal.close') }}</span>
          </button>
        </div>
        <v-form
          v-if="modalMode === 'normal'"
          ref="formRef" @submit.prevent="mode === MODES.NEW ? addArticle() : saveArticle()">
          <div class="edit-dialog-content flex flex-column flex-md-row">
            <div class="edit-dialog-content-preview d-flex d-md-block justify-center">
              <div class="font-type-b6 mb-4 d-none d-md-flex">{{ $t('admin.articles.imagePreview') }}</div>
              <div class="croppie-fake"/>
              <div class="edit-dialog-content-preview-container" :tabindex="mdAndUp ? 0 : -1">
                <div
                  class="edit-dialog-content-preview-image"
                  :style="{
                    'background-image': `url(${(article.croppyImageId ? getAttachmentUrlById(article.croppyImageId): photoPlaceholderUrl)})`
                  }"
                >
                  <div
                    v-if="article.croppyImageId"
                    class="justify-md-center justify-end edit-dialog-content-preview-image-cover"
                  >
                    <button
                      type="button"
                      class="mr-4 delete link align-self-center"
                      @click="() => removeImage(entry)"
                    >
                      <span class="sr-only">
                        {{
                          $t('admin.articles.remove')
                        }}
                      </span>
                    </button>
                    <button
                      type="button"
                      class="edit link align-self-center"
                      @click="() => editImage(entry)"
                    >
                      <span class="sr-only">
                        {{
                          $t('admin.articles.edit')
                        }}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="edit-dialog-content-form">
              <v-text-field
                :label="$t('admin.articles.labels.title')"
                class="input mt-2"
                v-model="article.title"
                variant="underlined"
                density="default"
                persistent-placeholder
                :rules="[validation.required]"
              />
              <v-text-field
                :label="$t('admin.articles.labels.contentUrl')"
                placeholder=""
                class="input mt-8"
                v-model="article.contentUrl"
                variant="underlined"
                density="default"
                persistent-placeholder
                :rules="[validation.required, validation.url]"
              />
              <UploadButton
                ref="uploadButton"
                :label="$t('admin.articles.labels.articleImage')"
                :textMobile="$t(`admin.articles.labels.${ article.croppyImageId ? 'mobileAddFile' : 'mobileNewFile'}`)"
                :minWidth="384"
                :minHeight="384"
                @uploaded="uploadedAttachment"
              />
            </div>
          </div>

          <Loader v-if="saving" class="pb-6 pt-6 pl-6 pr-6" />
          <div
            class="modal-buttons mt-6 mt-md-0"
          >
            <div class="modal-buttons-container">
              <div class="button">
                <Button
                  type="submit"
                  :text="mode === MODES.NEW ? $t('admin.articles.form.add') : $t('admin.articles.form.save')"
                  variant="black"
                />
              </div>
              <div class="button">
                <Button
                  type="button"
                  @click="closeDialog"
                  :text="$t('admin.articles.form.cancel')"
                  variant="white"
                />
              </div>
            </div>
          </div>
        </v-form>
        <div v-show="modalMode === 'croppie'">
          <div class="edit-dialog-content edit-dialog-croppie">
            <Croppie
              ref="croppieRef"
              :options = "croppieOptions"
            />
          </div>
          <div
            class="modal-buttons mt-6 mt-md-0">
            <div>
              <div class="zoom-slider d-none d-md-flex justify-space-between">
                <MinusIcon class="align-center" aria-hidden="true"/>
                <v-slider
                  class="my-auto"
                  v-model="zoomer"
                  :min="0.1"
                  :max="5"
                  density="compact"
                  hide-details
                  variant="outlined"
                  :elevation="0"
                  :thumb-size="16"
                  thumb-color="#0C2C5C"
                  track-color="#CED5DE"
                  track-fill-color="#CED5DE"
                />
                <PlusIcon class="align-center" aria-hidden="true"/>
              </div>
              <div class="button flex justify-end align-center">
                <Button
                  type="button"
                  class="mr-md-8 mt-6 mt-md-0"
                  :text="$t('admin.articles.form.save')"
                  variant="black"
                  @click="saveCroppedImage"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<style lang="scss" scoped>
  .croppie-fake {
    display: block;
    opacity: 0;
    position: absolute;
    top: 0;
    z-index: -1;
    width: 385px;
    height: 385px;
  }

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

      &-preview {
        flex: 0 1 300px;
        &-container {
          &:hover, &:focus-within {
            .edit-dialog-content-preview-image-cover {
              display: flex;
            }
          }
        }
        &-image {
          background-size: contain;
          width: 300px;
          height: 300px;

          &-cover {
            display: none;
            height: 100%;
            width: 100%;
            background-color: #1A1A1AD9;

            .delete {
              width: 40px;
              height: 40px;
              background-image: url('/img/Bin.svg');
              &:hover, &:focus {
                outline: none;
                background-image: url('/img/BinActive.svg');
              }
            }
            .edit {
              width: 40px;
              height: 40px;
              background-image: url('/img/Move.svg');
              &:hover, &:focus {
                outline: none;
                background-image: url('/img/MoveActive.svg');
              }
            }
          }
        }
      }

      &-form {
        flex: 0 1 486px;
      }

      &-divider {
        margin: 48px 0;
        border-bottom: 2px solid $color-primary-80;
      }
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

    .zoom-slider {
      flex: 0 1 534px;
      gap: 16px;
      padding: 16px 32px 16px 32px;
      background-color: $color-grey-7;

      .v-input.v-input--horizontal.v-slider {
        height: 16px;
      }
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

        &-preview {
          &-container {
            &:hover, &:focus-within {
              .edit-dialog-content-preview-image-cover {
                display: flex;
              }
            }
          }

          &-image {
            &-cover {
              display: flex;
              height: auto;
              background-color: #FFFFFF00;
              .delete {
                display: none;
              }
              .edit {
                background-image: url('/img/MoveActive.svg');
              }
            }
          }
        }

        &-form {
          flex: 0 1;
        }
      }

      &-croppie {
        background-color: $color-grey-6;
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
