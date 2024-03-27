<script setup>
import { useRouter } from 'vue-router'
import { getAttachmentUrlById } from '@/helpers/api'
import { getFiltersDataState } from '@/stores/filters'
import { getPublisherById } from '@/components/Search/commons/Search.helper'
import Button from '@/components/Button/Button.vue'
import PublisherTile from '@/components/Publisher/PublisherTile.vue'
import ShareIcon from '@/assets/icons/Share.svg'
import MaterialPreviewCarusel from '@/components/MaterialPreview/MaterialPreviewCarusel.vue'
import IconLink from '@/components/IconLink/IconLink.vue'
import HistoryCrumb from '@/components/HistoryCrumb/HistoryCrumb.vue'


const props = defineProps({
  publisherId: { type: String }
})
const router = useRouter()
const publisher = getPublisherById(props.publisherId)

if (!publisher) {
  router.push('/')
}
</script>

<template>
  <div v-if="publisher">
    <div
      class="publisher-preview limited-width pl-4 pr-4 pl-md-12 pr-md-12 mb-md-80 w-100"
    >
      <HistoryCrumb/>
      <div class="publisher-preview-tile mt-8 mt-md-12">
        <div class="d-md-none header-sm-2 color-black mb-4">{{ publisher.name }}</div>
        <img class="publisher-preview-tile-logo d-md-none" :src="getAttachmentUrlById(publisher.croppyImageId)" :alt="publisher.name"/>
        <PublisherTile :publisher="publisher">
          <IconLink
            class="mt-9 uppercase"
            icon="right"
            :href="`/publisher/search/${publisherId}`"
          >
            {{ $t("publisher.goToMaterials") }}
          </IconLink>
        </PublisherTile>
        <Button
          class="d-md-none"
          role="link"
          variant="white"
          :iconRight="ShareIcon"
          :text="$t('publisher.goToMaterials')"
          @click="router.push(`/publisher/search/${publisherId}`)"
        >
        </Button>
      </div>
    </div>
    <div class="limited-width pl-4 pr-4 pl-md-12 pr-md-12 w-100">
        <MaterialPreviewCarusel
          class="mt-8 mb-8 mt-md-80 mb-md-80"
          :publisher="publisher"
          :subjects="getFiltersDataState().rawSubjects.flatMap(el => el.items)"
        />
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @media (max-width: $MAX-WIDTH-MOBILE) {
    .publisher-preview-tile {
      background-color: $color-grey-6;
      padding: 16px;

      &-logo {
        width: 240px;
        height: 120px;
        border: 1px solid $color-primary-20;
      }
    }
  }
</style>
