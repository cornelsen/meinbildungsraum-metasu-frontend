<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Loader from '@/components/Loader/Loader.vue'
import UploadIcon from '@/assets/icons/FileUpload.svg'
import Button from '@/components/Button/Button.vue'
import { uploadAttachment } from '@/helpers/api'

const emit = defineEmits(['uploaded'])

const props = defineProps({
  label: { type: String, default: '' },
  minHeight: { type: Number, default: 0 },
  minWidth: { type: Number, default: 0 },
  textMobile: { type: String, default: '' },
})

const { t } = useI18n()
const errors = ref([])
const loading = ref(false)
const allowedExtensions = ['png', 'jpg', 'jpeg', 'gif']
const nativeUploadButton = ref(null)

const change = async (e) => {
  if (e.target.files && e.target.files[0]) {
    errors.value = []
    const file = e.target.files[0]
    await validate(file)
    if (errors.value.length) return
    loading.value = true
    try {
      const id = await uploadAttachment(file)
      emit('uploaded', id)
    } catch (e) {
      errors.value.push(t('errors.attachments.common'))
      console.log(e)
    }
    loading.value = false
  }
}

const mobileText = computed(() => {
  return props.textMobile
})

const validate = async (file) => {

  if (Math.round((file.size / 1024 / 1024) * 100) / 100 > 15) {
    errors.value.push(t('errors.attachments.fileSize'))
  }
  const extension = file.name.split('.').pop()
  if (!allowedExtensions.includes(extension)) {
    errors.value.push(`${t('errors.attachments.fileExtension')}${allowedExtensions.join(',')}`)
  }
  try {
    const { width, height } = await getImageDims(file)
    if (width < props.minWidth || height < props.minHeight) {
      errors.value.push(`${t('errors.attachments.fileDimensions')} ${props.minWidth}px x ${props.minHeight}px`)
    }
  } catch (e) {
    console.log(e)
  }
}


const validateControl = (id) => {
  errors.value = []
  if (!id) {
    return errors.value.push(t('validations.required'))
  }
}

const getImageDims = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = window.URL.createObjectURL(file)
    img.onload = () => {
      window.URL.revokeObjectURL(objectUrl)
      resolve({width: img.width, height: img.height})
    },
    img.onerror = reject
    img.src = objectUrl
  })
}

defineExpose({ validate: validateControl })
</script>
<template>
  <div class="flex flex-column">
    <div>
      <label class="upload-button flex color-black align-center mt-5">
        <input
          ref="nativeUploadButton" type="file" required @change="change"
          aria-errormessage="upl-errors"
        />
        <div class="upload-button-icon d-none d-md-block">
          <UploadIcon aria-hidden="true"/>
        </div>
        <div class="ml-0 ml-md-8">
        <div class="font-type-md-b6 font-type-sm-b1 color-black">{{ label }}</div>
        <div class="font-type-md-b6 font-type-sm-b5 color-grey-3">
          {{ `${$t('errors.attachments.fileDimensions')} ${props.minWidth}px x ${props.minHeight}px` }}
        </div>
      </div>
      </label>
    </div>
    <slot />
    <Button
      class="d-block d-md-none mt-6"
      variant="white"
      :text="mobileText"
      @click="nativeUploadButton ? nativeUploadButton.click() : null"
    />
    <div v-if="loading" class="mt-2">
      <Loader />
    </div>
    <div  id="upl-errors" class="upload-button-errors" aria-live="polite">
      <template v-if="errors.length">
        <span class="sr-only">{{ $t('errors.error') }}</span>
        <div v-for="(error, index) in errors" :key="index" class="mt-2 font-type-b6">
          {{ error }}
        </div>
      </template>
    </div>
  </div>
</template>
<style lang="scss" scoped>
  .upload-button {
    input[type=file] {
      position: absolute;
      height: 0;
      width: 0;
      opacity: 0;
      z-index: -1;
    }

    &-icon {
      height: 64px;
      width: 64px;
      padding: 16px;
      border: 1.5px solid $color-black;
    }

    &-errors {
      color: $color-error;
    }
  }

  .input-button {
    padding: 16px 8px;
    width: 100%;
    border-bottom: 1.5px solid $color-black;
    position: relative;
    outline: none;

    &:before {
      content: '';
      transition: width 0.15s cubic-bezier(0.4, 0, 0.2, 1);
      bottom: -1px;
      left: 0;
      height: 1.5px;
      width: 0;
      background: $color-black;
      position: absolute;
    }
    &:focus {
      outline: none;
    }
    &:hover, &:focus, &.active {
      &:before {
        width: 100%;
      }
    }

    &-content {
      text-overflow: ellipsis;
      text-wrap: nowrap;
    }
  }
</style>