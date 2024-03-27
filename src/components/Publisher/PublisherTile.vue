<script setup>
import Button from '@/components/Button/Button.vue'
import TypeRightIcon from '@/assets/icons/Type=Right.svg'
import { getAttachmentUrlById } from '@/helpers/api'

defineProps({
  publisher: {type: Object, default: () => {}}
})

const openLink = (url) => {
  window.open(url, '_blank')
}
</script>

<template>
  <div>
    <div class="publisher d-block d-lg-flex color-black">
      <div class="flex-column d-none d-md-flex">
        <div class="publisher-logo flex-shrink-1">
          <img :src="getAttachmentUrlById(publisher.croppyImageId)" :alt="publisher.name"/>
        </div>
        <slot></slot>
      </div>
      <div class="ml-0 ml-lg-16 w-100 flex flex-column">
        <div class="publisher-button header-2 mb-md-10 mb-6 flex flex-wrap justify-space-between">
          <div class="d-none d-md-block">{{ publisher.title }}</div>
          <Button
            role="link"
            @click="() => openLink(publisher.siteUrl)"
            variant="black"
            :text="$t('publisher.goToSite')"
            :iconRight="TypeRightIcon"
          >
          </Button>
        </div>
        <div class="publisher-description">
          <div class="font-type-md-b3 header-sm-9 mb-2 uppercase">{{ $t("publisher.description") }}</div>
          <div class="font-type-md-b5 header-sm-7 mb-md-10 mb-6">  {{  publisher.description }}</div>
        </div>
        <div class="publisher-since">
          <div class="font-type-md-b3 header-sm-9 mb-2 uppercase"> {{ $t("publisher.since") }} </div>
          <div class="font-type-md-b5 header-sm-7 mb-md-10 md-6">  {{  publisher.since }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .publisher {
    background-color: $color-grey-6;
    padding: 48px;

    &-logo {
      box-sizing: content-box;
      width: 480px;
      height: 240px;
      overflow: hidden;
      border: 2.53px solid $color-primary-20;

      img {
        position: relative;
        max-width: 100%;
        max-height: 100%;
        top: 50%;
        left: 50%;
        transform: translateY(-50%) translateX(-50%);
      }
    }

    &-button {
      order: 1
    }

    &-description {
      order: 2
    }

    &-since {
      order: 3
    }
  }

@media (max-width: $MAX-WIDTH-MOBILE) {
  .publisher-logo {
      img {
        position: static;
        transform: none;
      }
  }

  .publisher {
    padding: 16px 0;

    &-button {
      order: 2;
    }

    &-description {
      order: 1;
      margin-top: 8px;
    }

    &-since {
      order: 3
    }
  }
}

</style>
