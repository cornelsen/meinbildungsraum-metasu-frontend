<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import IconLink from '@/components/IconLink/IconLink.vue'

defineProps({
  variant: { type: String, default: 'black' },
})

const route = useRoute()
const router = useRouter()

const { t, locale } = useI18n()

const translation = ref('')
const hideCrumb = ref(false)

const setText = () => {
  if (window.history.state.back) {
    hideCrumb.value = false
    const url = window.history.state.back.split('/')
    if (url) {
      switch(url[1]) {
      case 'material':
        translation.value = t('publisher.backToMaterial')
        break
      case 'publisher':
        if(url[2] === 'search') {
          translation.value = t('matPreview.back')
        } else {
          translation.value = t('publisher.search.backToPublisher')
        }
        break
      case 'profile':
        translation.value = t('profile.backToProfile')
        break
      default:
        translation.value = t('matPreview.back')
      }
    }
  } else {
    hideCrumb.value = true
  }
}

watch(route, setText)
watch(() => locale.value, setText)

setText()

</script>

<template>
  <IconLink
    v-if="!hideCrumb"
    class="mt-8 mt-md-12 uppercase"
    icon="left"
    @click="router.back(-1)"
    :variant="variant"
  >
    {{ translation }}
  </IconLink>
</template>

<style lang="scss" scoped>
  a {
    outline: none;
  }
  .icon-link {
    .icon-link-left, .icon-link-right {
      position: relative;
      transition: transform .3s ease-out;
    }

    .icon-link-left {
      margin-right: 16px;
      &.small-margin {
        margin-right: 12px;
      }
    }
    .icon-link-right {
      margin-left: 16px;
      &.small-margin {
        margin-left: 12px;
      }
    }
    &:hover .icon-link-right, &:focus .icon-link-right {
      transform: translateX(12px);
    }

    &:hover .icon-link-left, &:focus .icon-link-left {
      transform: translateX(-12px);
    }
  }
</style>
