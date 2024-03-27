<!-- UNUSED -->
<script setup>
import { ref } from 'vue'
import CloseIcon from '@/assets/icons/Close.svg'
import SearchIcon from '@/assets/icons/Search.svg'

const emit = defineEmits(['update:modelValue', 'is:focused'])
defineProps({
  label: { type: String, default: '' },
  placeholder: { type: String, default: null },
  modelValue: { type: Array, default: () => [] }
})

const tags = ref([])
const inputModel = ref([])


// TODO trigger changes
/*const model = computed({
  get () {
    return props.modelValue
  },
  set (value) {
    return emit('update:modelValue', value)
  }
})*/

const inputChanged = (value) => {
  if (!value.includes(',')) return

  const newTags = value.split(',')
  if (newTags.length) {
    for (var i = 0; i < newTags.length; i += 1) {
      if (newTags[i] !== '') tags.value.push(newTags[i])
    }
    inputModel.value = ''
  }
}

const removeTag = (index) => {
  tags.value.splice(index, 1)
}
</script>

<template>
  <v-text-field
    :label="label"
    class="input input-tags"
    v-model="inputModel"
    placeholder="Type here"
    :append-inner-icon="SearchIcon"
    variant="underlined"
    density="default"
    hide-details
    persistent-placeholder
    @update:modelValue="inputChanged"
    @focus="emit('is:focused', true)"
    @blur="emit('is:focused', false)"
  >
  <template v-slot:append-inner>
    <div class="tags header-10 color-black">
      <div v-for="(tag, index) in tags" class="tag" :key="index">{{ tag }}
        <button
          class="link"
          @click="removeTag(index)"
          type="button"
        >
          <CloseIcon  viewBox="0 0 24 24" class="close-icon link black-icon"/>
        </button>
      </div>
    </div>
  </template>
  </v-text-field>
</template>

<style lang="scss">
  .input-tags {
    .v-input__control {
      .v-field.v-field--appended.v-field--variant-underlined {
        grid-template-columns: min-content minmax(0, 2fr) min-content minmax(0, 5fr);

        .v-field__field {
          align-self: flex-end;
        }
        .v-field__append-inner {
          justify-content: flex-end;

          .v-icon {
            align-self: flex-end;
            margin-bottom: 16px;
          }
        }
      }
    }
  }
  .tags {
    display: block;
    margin-right: 20px;
    margin-bottom: 16px;

    .tag {
      margin-top: 20px;
      display: inline-block;
      margin-right: 16px;
      padding: 8px 12px;
      background-color: $color-grey-6;

      .close-icon {
        display: inline-block;
        margin-left: 8px;
        margin-bottom: 1px;
        border-radius: 8px;
        width: 12px;
        height: 12px;
        vertical-align: middle;
      }
    }
  }

</style>
