<script setup>
import { watch, ref } from 'vue'
import { useDisplay } from 'vuetify'

const emit = defineEmits(['click'])

const props = defineProps({
  text: { type: String, default: '' },
  compact: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  variant: { type: String, default: 'white' },
  iconLeft: {type: Object, default: undefined },
  iconRight: {type: Object, default: undefined }
})

const color = ref(props.variant)
const label = ref(props.text)

const { mdAndUp } = useDisplay()

watch(() => props.variant, value => color.value = value)
watch(() => props.text, value => label.value = value)

</script>

<template>
  <v-btn
    @click="() => emit('click')"
    variant="outlined"
    class="rounded-0 d-flex"
    :class="{'button-black': color !== 'white', 'compact': compact}"
    :width="compact ? 'auto' : undefined"
    :height="compact ? '40px' : (mdAndUp ? '56px' : '48px')"
    :rounded="false"
    :ripple="false"
    flat
    :disabled="disabled"
  >
    <div
      class="font-button | flex align-center"
      :class="{
        'color-grey-7': color !== 'white' && disabled,
        'color-grey-5': color === 'white' && disabled,
        'justify-space-between': (iconLeft || iconRight),
        'justify-center': !(iconLeft || iconRight),
        }"
    >
      <slot></slot>
      <div class="icon-left" v-if="!compact && (iconLeft || iconRight)">
        <component :is="iconLeft" aria-hidden="true" :class="{ 'black-icon': color === 'white', 'white-icon': color !== 'white' }"/>
      </div>
        {{ label }}
      <div class="icon-right" v-if="!compact && (iconLeft || iconRight)">
        <component :is="iconRight" aria-hidden="true" :class="{ 'black-icon': color === 'white', 'white-icon': color !== 'white' }"/>
      </div>
    </div>
  </v-btn>
</template>

<style lang="scss">
  button.v-btn--variant-outlined:not(.compact) {
    min-width: 227px;
    padding: 0 24px;
  }

  button.v-btn--variant-outlined {
    background-color: #FFFFFFFF;
    border: 1.5px solid $color-black;
    transition: border-color 0.3s ease;

    &:hover, &:focus {
      border-color: $color-primary-100;
      color: $color-primary-100;

      &::after {
        opacity: 0;
      }
      .v-btn__content > div {
        color: $color-primary-100;
      }
    }

    .v-btn__content > div {
      color: $color-black;
    }

    &.v-btn:focus > .v-btn__overlay,
    &.v-btn:hover > .v-btn__overlay {
      opacity: 0;
    }

    &.v-btn--disabled {
      opacity: 1;
      border: 1.5px solid $color-grey-5;

      ::after {
        opacity: 1;
      }
    }
  }


  button.button-black {
    background-color: $color-black;
    border: 1.5px solid $color-black;
    transition: background-color 0.3s ease;

    &:hover, &:focus {
      background-color: $color-primary-100;
      border: 1.5px solid $color-primary-100;

      .v-btn__content > div {
        color: #FFFFFFFF;
      }
    }

    &.v-btn:focus > .v-btn__overlay,
    &.v-btn:hover > .v-btn__overlay {
      opacity: 0;
    }

    .v-btn__content > div {
      color: #FFFFFFFF;
    }

    &.v-btn--disabled {
      border: 1.5px solid $color-grey-5;
      background-color: $color-grey-5;
    }
  }
  .icon-left {
    margin-top: 6px;
    width: 24px;
    margin-right: 30px;
  }
  .icon-right {
    margin-top: 6px;
    width: 24px;
    margin-left: 30px;
  }

  @media (max-width: $MAX-WIDTH-MOBILE) {
    button.v-btn--variant-outlined:not(.compact) {
      min-width: 100%;

      .v-btn__content {
        width: 100%;

        & > div {
          flex-basis: 100%;
        }
      }
    }
  }

</style>
