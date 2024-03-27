<script setup>
import ArrowRightIcon from '@/assets/icons/Side=Right.svg'
import ArrowLeftIcon from '@/assets/icons/Side=Left.svg'
import { useDisplay } from 'vuetify'
const { mdAndUp } = useDisplay()

const emit = defineEmits(['click'])

const props = defineProps({
  icon: { type: String, default: 'left' },
  variant: { type: String, default: 'black' },
  href: { type: String, default: undefined },
  smallGap: { type: Boolean, default: false }
})

const click = (e) => {
  if (!props.href)  {
    e.preventDefault()
  }
  emit('click')
}

</script>

<template>
  <component
    :is="href ? 'router-link' : 'button'"
    :to="href ? href : undefined"
    class="flex color-black font-button link icon-link fit-content align-center font-type-sm-b3 header-md-9"
    :class="{ 'white' : variant === 'white'}"
    @click.prevent="click"
  >
    <ArrowLeftIcon
      v-if="icon === 'left'"
      class="icon-link-left"
      :class="{
        'small-margin': smallGap,
        'black-icon': variant === 'black',
        'white-icon': variant === 'white'
      }"
      aria-hidden="true"
      :width="mdAndUp ? 32 : 24"
      :height="mdAndUp ? 32 : 24"
    />
    <div><slot /></div>
    <ArrowRightIcon
      v-if="icon !== 'left'"
      :class="{
        'small-margin': smallGap,
        'black-icon': variant === 'black',
        'white-icon': variant === 'white'
      }"
      class="icon-link-right"
      aria-hidden="true"
      :width="mdAndUp ? 32 : 24"
      :height="mdAndUp ? 32 : 24"
      />
  </component>
</template>

<style lang="scss" scoped>
  .white {
    color: #FFF !important
  }
  a {
    outline: none;
  }
  .icon-link {
    white-space: nowrap;
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
    &:hover .icon-link-right,
    &:focus-visible .icon-link-right,
    &:focus .icon-link-right {
      transform: translateX(12px);
    }

    &:hover .icon-link-left,
    &:focus-visible .icon-link-left,
    &:focus .icon-link-left {
      transform: translateX(-12px);
    }
  }

  @media (max-width: $MAX-WIDTH-MOBILE) {
    .icon-link {
      .icon-link-left  {
        margin-right: 8px;
        &.small-margin {
          margin-right: 8px;
        }
      }
      .icon-link-right {
        margin-left: 8px;
        &.small-margin {
          margin-left: 8px;
        }
      }
    }
  }
</style>
