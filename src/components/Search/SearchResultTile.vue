<script setup>
import { useDisplay } from 'vuetify'

import HatIcon from '@/assets/icons/Type=Hat.svg'
import GroupIcon from '@/assets/icons/Type=Gropu.svg'

import { RawMediaTypes }  from '@/enums/mediatypes'
import VideoIcon from '@/assets/icons/Big=No, Black=Yes, Type=Video, Focused=No.svg'
import AudioIcon from '@/assets/icons/Big=No, Black=Yes, Type=Audio, Focused=No.svg'
import ImageIcon from '@/assets/icons/Big=No, Black=Yes, Type=Photos, Focused=No.svg'
import DocumentIcon from '@/assets/icons/Big=No, Black=Yes, Type=Document, Focused=No.svg'
import InteractiveIcon from '@/assets/icons/Big=No, Black=Yes, Type=Interactive, Focused=No.svg'

const props = defineProps({
  result: {type: Object, default: () => {}}
})

const { mdAndUp } = useDisplay()

const getComponentByType = () => {
  switch (props.result.type) {
  case RawMediaTypes.MEDIA_IMAGES_VISUALS:
    return ImageIcon
  case RawMediaTypes.MEDIA_VIDEO:
    return VideoIcon
  case RawMediaTypes.MEDIA_AUDIO:
    return AudioIcon
  case RawMediaTypes.INTERACTIVE_ANIMATION:
  case RawMediaTypes.INTERACTIVE_SIMULATION:
  case RawMediaTypes.INTERACTIVE_WHITEBOARD:
    return InteractiveIcon
  case RawMediaTypes.TEXT_BOOK:
  case RawMediaTypes.TEXT_CHAPTER:
  case RawMediaTypes.TEXT_DOCUMENT:
  case RawMediaTypes.TEXT_PASSAGE:
  case RawMediaTypes.TEXT_REFERENCE:
  case RawMediaTypes.TEXT_WEBSITE:
    return DocumentIcon
  default:
    return null
  }
}

const getBackgroundImage = () => {
  if (props.result.image) return props.result.image
  switch (props.result.type) {
  case RawMediaTypes.MEDIA_IMAGES_VISUALS:
    return '/PlaceholderPhoto.svg'
  case RawMediaTypes.MEDIA_VIDEO:
    return '/PlaceholderVideo.svg'
  case RawMediaTypes.MEDIA_AUDIO:
    return '/PlaceholderAudio.svg'
  case RawMediaTypes.INTERACTIVE_ANIMATION:
  case RawMediaTypes.INTERACTIVE_SIMULATION:
  case RawMediaTypes.INTERACTIVE_WHITEBOARD:
    return '/PlaceholdeInteractive.svg'
  default:
    return '/PlaceholderDocument.svg'
  }
}
</script>

<template>
  <router-link
    :to="`/material/${result.publisher.id}/${result.productId}`"
    class="tile link"
  >
    <v-tooltip
      activator="parent"
      location="start"
      open-on-focus
      :text="result.title"
    />
    <div class="tile-image"
        :class="{placeholder: result.image === undefined}"
    >
      <div
        class="tile-image-background"
        :style="{background: `linear-gradient(0deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)),  url(${getBackgroundImage()})  0 0/100% 100%`}"></div>
      <img :src="getBackgroundImage()" :alt="result.title"/>
    </div>
    <div v-if="getComponentByType()" class="tile-type">
      <component
        :is="getComponentByType()"
        :height="mdAndUp ? 56 : 32"
        :width="mdAndUp ? 56 : 32"
      />
    </div>
    <div class="tile-info">
      <div class="color-black">
        {{ result.title }}
      </div>
    </div>
    <div class="tile-publisher">
      <div class="font-type-b5 color-black">
        {{ result.publisher.title }}
      </div>
    </div>
    <div class="tile-icons font-type-b5 color-grey-4 d-none d-md-flex">
        <div class="tile-icons-entry">
          <HatIcon class="flex-shrink-0 grey-4-icon"/>
          <span class="tile-icons-text">
            <span v-if="result.subjects && result.subjects.length" class="sr-only">
              <template v-if="result.subjects.length > 1">
                {{ $t("srOnly.subjects") }}
              </template>
              <template v-else>
                {{ $t("srOnly.subject") }}
              </template>
            </span>
            <template v-for="(subject, index) in result.subjects">
              {{ $t(`search.subjects.${subject}`) }}{{ index < result.subjects.length - 1 ? ', ' : ''}}
            </template>
          </span>
        </div>
        <div class="tile-icons-entry">
          <GroupIcon class="flex-shrink-0 grey-4-icon"/>
          <span v-if="result.age" class="sr-only">
            {{ $t("srOnly.studyYear") }}
          </span>
          <span class="tile-icons-text">{{ result.age }}</span>
        </div>
    </div>
  </router-link>
</template>

<style lang="scss" scoped>
  @import "../../styles/_fonts.scss";
  .tile {
    background-color: #FFFFFFFF;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    filter: drop-shadow(2.11804px 8.47216px 21.1804px rgba(0, 0, 0, 0.07));
    transition: border 0.2s linear;
    border: 1.5px solid transparent;
    @extend %font-type-b3;

    &:hover, &:focus {
      border: 1.5px solid $color-primary-100;
    }
    &:focus {
      outline: none;
    }
    &.small {
      width: 300px;
      height: 100%;
      .tile-image:not(.placeholder) {
        height: 265px;
        img {
          max-height: calc(100% - 56px);;
        }
      }
      .tile-info {
        margin: 16px 80px 8px 16px;
        @extend %font-type-b3;
      }
    }
    &.big {
      width: 340px;
      .tile-image:not(.placeholder) {
        img {
          max-height: calc(100% - 64px);
        }
      }
      .tile-type {
        top: 270px;
      }
    }
    .tile-image.placeholder {
      img {
        max-width: initial;
        max-height: 100%
      }
    }
    &-image {
      overflow: hidden;
      height: 300px;
      width: 100%;
      position: relative;

      &-background {
        filter: blur(15px);
        position: relative;
        height: 150%;
        width: 150%;
        top: -25%;
        left: -25%;
      }
      img {
        position: absolute;
        z-index: 1;
        max-width: 100%;
        max-height: 100%;
        top: 50%;
        left: 50%;
        transform: translateY(-50%) translateX(-50%);
      }
    }
    &-type {
      position: absolute;
      right: 16px;
      top: 237px;
      z-index: 1;
    }
    &-info {
      margin: 16px 65px 8px 16px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }
    &-publisher {
      padding: 0 16px 24px 16px;
      margin: auto 0;
    }
    &-icons {
      flex-wrap: wrap;
      padding-bottom: 16px;
      padding-left: 16px;

      &-entry {
        display: flex;
        flex-grow: 1;
        flex-basis: 50%;
      }
      &-text {
        display: inline-block;
        margin-left: 8px;
        margin-bottom: 8px;
      }
    }
  }

  @media (max-width: $MAX-WIDTH-MOBILE) {
    .tile {
      &.small {
        width: 156px;
        height: 196px;
        .tile-type {
          top: 120px;
        }

        .tile-image:not(.placeholder) {
          height: 136px;
        }

        .tile-info {
          @extend %font-type-sm-b6;
          margin: 4px 46px 0 4px;
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          }
      }
      &.big {
        width: 164px;
        height: 212px;
        .tile-image:not(.placeholder) {
          img {
            max-height: calc(100% - 30px);
          }
        }
        .tile-info {
          @extend %font-type-sm-b6;
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
        .tile-type {
          top: 132px;
        }
      }

      &-image {
        height: 144px;
      }

      &-info {
        @extend %header-sm-10;
        margin: 4px 46px 0 4px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
      }
      &-publisher {
        padding: 0 4px 4px 4px;
        margin: 0;
        position: absolute;
        bottom: 0;
      }
    }
  }
</style>
