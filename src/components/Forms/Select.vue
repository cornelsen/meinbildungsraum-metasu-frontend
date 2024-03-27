<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import BlackChevronIcon from '@/assets/icons/Type=Down.svg'
import WhiteChevronIcon from '@/assets/icons/Type=Down-white.svg'
import CloseIcon from '@/assets/icons/Close.svg'
import HistoryIcon from '@/assets/icons/History.svg'

const emit = defineEmits(['update:modelValue', 'is:focused'])
const props = defineProps({
  label: { type: String, default: '' },
  placeholder: { type: String, default: null },
  noEmpty: { type: Boolean, defauly: false},
  multiple: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
  items: { type: Array, default: () => []},
  modelValue: { type: Array, default: () => [] },
  variant: { type: String, default: 'white'},
  lastUsed: { type: Array, default: () => [] },
})

const model = computed({
  get () {
    if (Array.isArray(props.modelValue)) return props.modelValue
    return [props.modelValue]
  },
  set (value) {
    const newValues = Array.isArray(value) ? value : [ value ]
    return emit('update:modelValue', newValues.filter(el => el !== 'EMPTY'))
  }
})

const items = ref(
  props.multiple || props.noEmpty || props.items.length === 0 ?
    [ ...(props.items.length ? props.lastUsed : []), ...props.items] :
    [...(props.items.length ? props.lastUsed : []), { label: ' ', key: 'EMPTY'}, ...props.items]
)

watch([ () => props.items, () => props.lastUsed ], () => {
  const newVals = props.multiple || props.noEmpty || props.items.length === 0  ?
    props.items :
    [ {label: ' ', key: 'EMPTY'}, ...props.items]
  items.value = [...(props.items.length ? props.lastUsed : []), ...newVals]
})

const onKeyDown = (e, prop) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    const elIndex = model.value.indexOf(prop.value)
    if (elIndex > -1) {
      model.value.splice(elIndex, 1)
    } else {
      if (props.multiple) {
        model.value.push(prop.value)
      } else {
        model.value = [prop.value]
      }
    }
  }
}

const selRef = ref()

onMounted(() => {
  selRef.value.$el.querySelector('.v-field.v-field--appended').role = 'combobox'
})
</script>

<template>
  <v-select
    ref="selRef"
    class="combobox"
    :class="{'not-empty': model.length > 0, 'loader-visible': loading, 'combobox-blue': variant === 'blue'}"
    :label="label ? label : null"
    :items="items"
    item-value="key"
    :theme="variant === 'blue' ? 'blue' : undefined"
    :menu-icon="!loading ? (variant === 'blue' ? WhiteChevronIcon : BlackChevronIcon) : undefined"
    :placeholder="placeholder"
    v-model="model"
    variant="underlined"
    density="default"
    :no-data-text = "$t('search.selectNoData')"
    :hide-details="!error"
    item-title="label"
    :multiple="multiple"
    :persistent-placeholder="placeholder !== null"
    @focus="emit('is:focused', true)"
    @blur="emit('is:focused', false)"
  >
    <template v-slot:item="data">
      <div
        v-if="data.item.raw.header"
        class="combobox-item optgroup header-10 color-black"
      >
        {{ data.item.title }}
      </div>
      <div
        v-else
        class="combobox-item header-9"
        :class="[{
          'active': model.includes(data.item?.raw?.key),
          'color-grey-3': data.item?.raw?.lastUsed,
          'ćolor-black': !data.item?.raw?.lastUsed
        }]"
        v-bind="data.props"
        :onKeydown="(e) => onKeyDown(e, data.props)"
        tabindex="0"
      >
        <HistoryIcon v-if="data.item?.raw?.lastUsed" class="history-icon grey-3-icon" aria-hidden="true"/>
        {{ data.item.title }}
        <CloseIcon class="close-icon float-right" v-if="multiple && model.includes(data.item?.raw?.key)" />
      </div>
    </template>
    <template v-slot:append-inner v-if="loading">
      <img src="/Loader.png" class="loader rotate"/>
    </template>
  </v-select>
</template>

<style lang="scss" scoped>
  .combobox {
    &-item {
      padding: 8px 16px;
      min-height: 40px;
      cursor: pointer;

      &:focus,
      &.active:not(.optgroup),
      &:hover:not(.optgroup) {
        color: #FFFFFF;
        background-color: $color-primary-90;
        outline: none;

        .history-icon {
          stroke: #fff;
        }
      }
      .close-icon {
        margin-left: 8px;
      }

      .history-icon {
        margin-right: 8px;
        line-height: 22px;
        vertical-align: middle;
      }

      &.optgroup {
        min-height: 16px;
        background-color: $color-primary-10
      }
    }

    &.loader-visible {

      @keyframes rotating {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
      .rotate {
        animation: rotating 1s linear infinite;
      }

      .loader {
        margin-top: 25px;
      }

    }
  }

</style>
