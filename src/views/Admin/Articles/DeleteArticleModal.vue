<script setup>
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import { service} from '@/helpers/api'
import Button from '@/components/Button/Button.vue'
import Modal from '@/components/Modal/Modal.vue'
import CloseIcon from '@/assets/icons/Exit.svg'

const emit = defineEmits(['removed', 'error', 'update:modelValue'])
const props = defineProps({
  article: { type: Object, default: () => null },
  modelValue: { type: Boolean, default: false }
})

const { mdAndUp } = useDisplay()


const dialogOpen = computed({
  get () {
    return props.modelValue
  },
  set (value) {
    return emit('update:modelValue', value)
  }
})

const closeDialog = () => {
  dialogOpen.value = false
}

const deleteArticle = async () => {
  try {
    await service.delete(`/articles/${props.article.id}`)
    emit('removed')
  } catch (e) {
    emit('error')
    console.log('error %o', e)
  }
  closeDialog()
}

</script>

<template>
  <div>
    <Modal
      v-model="dialogOpen"
      @update:modelValue="closeDialog"
      :fullscreen="false"
      :width="mdAndUp ? '740' : '343'"
    >
      <div class="remove-dialog">
        <div class="flex justify-end pr-6 pt-6">
          <button
            class="link"
            @click="closeDialog"
            type="button"
          >
            <CloseIcon class="link black-icon" aria-hidden="true"/>
            <span class="sr-only">{{ $t('modal.close') }}</span>
          </button>
        </div>
        <div class="remove-dialog-content">
          <div class="text-center header-8 mb-0 mb-md-6">
            {{ $t("admin.articles.delete.prompt") }}:
            <span class="header-7"> {{ article.title }}?</span>
          </div>
        </div>
        <div class="flex justify-center align-center pb-6 pb-md-11">
          <Button
            @click="deleteArticle"
            class="mr-3 mr-md-13"
            :text="$t('admin.articles.delete.confirm')"
            variant="black"
            :compact="!mdAndUp"
          />
          <Button
            @click="closeDialog"
            :text="$t('admin.articles.delete.cancel')"
            variant="white"
            :compact="!mdAndUp"
          />
        </div>

      </div>
    </Modal>
  </div>
</template>

<style lang="scss" scoped>
  .remove-dialog {
    background-color: #FFF;
    color: $color-black;

    &-content {
      padding: 24px;
    }
  }

  @media (max-width: $MAX-WIDTH-MOBILE) {
    .remove-dialog {
      &-content {
        padding: 16px 24px 24px 24px;
      }
    }
  }

</style>
