<script setup>
import { ref, reactive, computed, watch, nextTick} from 'vue'
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'
import { service, uploadAttachment, getAttachmentUrlById} from '@/helpers/api'
import CroppieLib from 'croppie/croppie'
import Croppie from '@/components/Croppie/Croppie.vue'
import Button from '@/components/Button/Button.vue'
import UploadButton from '@/components/Button/UploadButton.vue'
import Modal from '@/components/Modal/Modal.vue'
import Loader from '@/components/Loader/Loader.vue'
import CloseIcon from '@/assets/icons/Exit.svg'
import MinusIcon from '@/assets/icons/Minus.svg'
import PlusIcon from '@/assets/icons/Plus.svg'

const MODES = {
  'NEW': 'NEW',
  'EDIT': 'EDIT'
}

const emit = defineEmits(['added', 'edited', 'activated', 'error', 'update:modelValue'])
const props = defineProps({
  provider: { type: Object, default: () => null },
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

const formRef = ref()
const saving = ref(false)
const modalMode = ref('normal')
const croppieRef = ref(null)
const publisher = ref({})
const previewImage = ref('')
const zoomer = ref(0)
const uploadButton = ref(null)

const croppieOptions = reactive({
  boundary: { width: 800, height: 500 },
  viewport: { width: 480, height: 240, type: 'square' },
  showZoomer: false
})

const defaultCroppieParams = {
  points: [ 0, 0, croppieOptions.viewport.width, croppieOptions.viewport.height ],
  zoom: 1,
  orientation: 1
}

const croppyParams = ref({})

const applyPreviewImage = async () => {
  modalMode.value = 'croppie'
  await croppieRef.value.crop.bind({
    url: previewImage.value,
    ...croppyParams.value,
  })
  zoomer.value = croppyParams.value.zoom
}

const closeDialog = () => {
  dialogOpen.value = false
}

const validation = {
  required: value => !!value || t('validations.required'),
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

const addPublisher = async () => {
  const isInvalid = (await formRef.value.validate()).valid === false
  uploadButton.value.validate(publisher.value.croppyImageId)
  if (isInvalid || !publisher.value.croppyImageId) {
    return
  }
  saving.value = true
  try {
    await service.post('/admin/publisher', {
      name: publisher.value.name,
      title: publisher.value.title,
      description: publisher.value.description,
      siteUrl: publisher.value.siteUrl,
      searchUrl: publisher.value.searchUrl,
      since: publisher.value.since,
      croppyImageId: publisher.value.croppyImageId,
      originImageId: publisher.value.originImageId,
      croppyParams: JSON.stringify(croppyParams.value)
    })
    emit('added')
  } catch (e) {
    emit('error')
    console.log('error %o', e)
  }
  saving.value = false
  closeDialog()
}

const savePublisher = async () => {
  const isInvalid = (await formRef.value.validate()).valid === false
  uploadButton.value.validate(publisher.value.croppyImageId)
  if (isInvalid || !publisher.value.croppyImageId) {
    return
  }
  saving.value = true
  try {
    await service.put('/admin/publisher', {
      id: publisher.value.id,
      name: publisher.value.name,
      title: publisher.value.title,
      description: publisher.value.description,
      siteUrl: publisher.value.siteUrl,
      searchUrl: publisher.value.searchUrl,
      since: publisher.value.since,
      croppyImageId: publisher.value.croppyImageId,
      originImageId: publisher.value.originImageId,
      croppyParams: JSON.stringify(croppyParams.value)
    })
    emit('edited', { ...publisher.value })
  } catch (e) {
    emit('error')
    console.log('error %o', e)
  }
  saving.value = false
  closeDialog()
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
    publisher.value.originImageId = id
    publisher.value.croppyImageId = newId
    previewImage.value = getAttachmentUrlById(id)
  } catch (e) {
    console.log('error %o', e)
  }
  fakeCroppie.destroy()
}

const saveCroppedImage = async () => {
  croppyParams.value = JSON.parse(JSON.stringify(croppieRef.value.crop.get()))
  try {
    const file = await croppieRef.value.crop.result({type: 'blob'})
    const id = await uploadAttachment(file)
    publisher.value.croppyImageId = id
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
  publisher.value.originImageId = undefined
  publisher.value.croppyImageId = undefined
}

watch(zoomer, () => {
  croppieRef.value.crop.setZoom(zoomer.value)
})

watch(modalMode, (val) => {
  if (val === 'croppie') {
    nextTick(() => {
      const croppieContainer = document.querySelector('.cr-viewport')
      croppieContainer?.scrollIntoView({ block: 'center' })
    })
  }
})

watch(dialogOpen, (val) => {
  if (val) {
    previewImage.value = ''
    if (props.mode === MODES.NEW) {
      publisher.value = {
        name: '',
        title: '',
        description: '',
        siteUrl: '',
        searchUrl: '',
        since: '',
        croppyImageId: '',
        originImageId: '',
      }
      croppyParams.value = JSON.parse(JSON.stringify(defaultCroppieParams))
    } else {
      publisher.value = { ... props.provider }
      try {
        croppyParams.value = JSON.parse(publisher.value.croppyParams)
      } catch (e) {
        console.log(e)
        croppyParams.value = JSON.parse(JSON.stringify(defaultCroppieParams))
      }
      previewImage.value = getAttachmentUrlById(publisher.value.originImageId)
    }
  }
})

const photoPlaceholderUrl = `${window.origin}/logoPlaceholderPhoto.png`

</script>

<template>
  <div>
    <Modal
      v-model="dialogOpen"
      @update:modelValue="closeDialog"
      persistent
      scrollable
      width="999"
    >
      <div class="edit-dialog">
        <div class="flex justify-end edit-dialog-toolbar">
          <div
            v-if="modalMode === 'croppie'"
            class="flex w-100 font-type-md-b1 header-sm-2"
          >
            {{ $t('admin.providers.dragTitle') }}
          </div>
          <div
            v-else
            class="d-flex d-md-none header-sm-2 w-100"
          >
            {{ $t('admin.providers.editTitle') }}
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
          ref="formRef" @submit.prevent="() => mode === MODES.NEW ? addPublisher() : savePublisher()">
          <div class="edit-dialog-content">
            <v-text-field
              :label="$t('admin.providers.labels.name')"
              :placeholder="$t('admin.providers.labels.namePlaceholder')"
              class="input"
              v-model="publisher.name"
              variant="underlined"
              density="default"
              persistent-placeholder
              :rules="[validation.required]"
            />
            <v-text-field
              :label="$t('admin.providers.labels.title')"
              placeholder=""
              class="input input-margin"
              v-model="publisher.title"
              variant="underlined"
              density="default"
              persistent-placeholder
              :rules="[validation.required]"
            />
            <v-text-field
              :label="$t('publisher.since')"
              placeholder=""
              class="input input-margin"
              v-model="publisher.since"
              variant="underlined"
              density="default"
              hide-details
              persistent-placeholder
            />
            <v-textarea
              class="input input-margin"
              :label="$t('publisher.description')"
              placeholder=""
              v-model="publisher.description"
              variant="underlined"
              density="default"
              hide-details
              persistent-placeholder
            />
            <div class="separator"></div>
            <v-text-field
              :label="$t('admin.providers.labels.siteUrl')"
              placeholder=""
              class="input input-margin"
              v-model="publisher.siteUrl"
              variant="underlined"
              density="default"
              persistent-placeholder
              :rules="[validation.required, validation.url]"
            />
            <div class="croppie-fake"/>
            <div class="d-block d-md-flex align-center mb-0 mb-md-12">
              <div class="d-none d d-md-block edit-dialog-content-preview-container mr-6" :tabindex="mdAndUp ? 0 : -1">
                <div
                  class="edit-dialog-content-preview-image mt-6"
                  :style="{
                    'background-image': `url(${(publisher.croppyImageId ? getAttachmentUrlById(publisher.croppyImageId): photoPlaceholderUrl)})`
                  }"
                >
                  <div
                    v-if="publisher.croppyImageId"
                    class="justify-md-center justify-end edit-dialog-content-preview-image-cover"
                  >
                    <button
                      type="button"
                      class="mr-4 delete link align-self-center"
                      @click="() => removeImage(entry)"
                    >
                      <span class="sr-only">
                        {{
                          $t('admin.publisher.remove')
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
                          $t('admin.publisher.edit')
                        }}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              <UploadButton
                ref="uploadButton"
                :label="$t('admin.providers.labels.logoImage')"
                :textMobile="$t(`admin.providers.labels.${ publisher.croppyImageId ? 'mobileAddFile' : 'mobileNewFile'}`)"
                :minWidth="480"
                :minHeight="240"
                @uploaded="uploadedAttachment"
              >
                <div class="d-block d-md-none edit-dialog-content-preview-container" :tabindex="mdAndUp ? 0 : -1">
                  <div
                    class="edit-dialog-content-preview-image mt-6"
                    :style="{
                      'background-image': `url(${(publisher.croppyImageId ? getAttachmentUrlById(publisher.croppyImageId): photoPlaceholderUrl)})`
                    }"
                  >
                    <div
                      v-if="publisher.croppyImageId"
                      class="justify-md-center justify-end edit-dialog-content-preview-image-cover"
                    >
                      <button
                        type="button"
                        class="edit link align-self-center"
                        @click="() => editImage(entry)"
                      >
                        <span class="sr-only">
                          {{
                            $t('admin.providers.edit')
                          }}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </UploadButton>
            </div>
            <v-text-field
            :label="$t('admin.providers.labels.searchUrl')"
              placeholder=""
              class="input input-margin"
              v-model="publisher.searchUrl"
              variant="underlined"
              density="default"
              persistent-placeholder
              :rules="[validation.required, validation.url]"
            />
          </div>

          <Loader v-if="saving" class="pb-6 pt-6 pl-6 pr-6" />

          <div
            class="modal-buttons mt-6 mt-md-0"
          >
            <div class="modal-buttons-container">
              <div class="button">
                <Button
                type="submit"
                :text="mode === MODES.NEW ? $t('admin.providers.form.add') : $t('admin.providers.form.save')"
                variant="black"
                />
              </div>
              <div class="button">
                <Button
                  type="button"
                  @click="closeDialog"
                  :text="$t('admin.providers.form.cancel')"
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
                  :text="$t('admin.providers.form.save')"
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
    width: 480px;
    height: 240px;
  }

  .edit-dialog {
    background-color: #FFF;
    color: $color-black;
    overflow-y: scroll;

    &-toolbar {
      position: sticky;
      top: 0;
      z-index: 6;
      background-color: #FFF;
      padding: 24px 24px;
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
          border: 1px solid $color-primary-20;
          background-size: contain;
          width: 240px;
          height: 120px;

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
    }

    .separator {
      content: '';
      margin-top: 48px;
      margin-bottom: 48px;
      border-bottom: 2px solid $color-grey-6;
    }

    .apply-button {
      color: $color-grey-4;
    }
  }

  .green {
    color: $color-success;
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


  @media (max-width: $MAX-WIDTH-MOBILE) {
    .edit-dialog {
      width: 100%;
      height: 100%;
      background-color: $color-grey-6;

      &-toolbar {
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
      }

      .separator {
        margin-top: 24px;
        margin-bottom: 24px;
      }

      .modal-buttons {
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
          .separator {
            width: 8px;
          }
        }
      }
    }
  }

  .input-margin {
    margin-top: 22px;
  }
</style>
