<script setup>
import { ref, watch, computed } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import CharacterCount from '@tiptap/extension-character-count'
import Button from '@/components/Button/Button.vue'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import BoldIcon from '@/assets/icons/Bold.svg'
import ItalicIcon from '@/assets/icons/Italic.svg'
import LinkIcon from '@/assets/icons/Link.svg'
import Document from '@tiptap/extension-document'
import Dropcursor from '@tiptap/extension-dropcursor'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Link from '@tiptap/extension-link'
import InputText from '@/components/Forms/InputText.vue'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Extension } from '@tiptap/core'

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  display: {type: Boolean, default: false},
  modelValue: {type: Object, default: () => {}},
  content: {type: Object, default: null}
})

const model = computed({
  get () {
    return props.modelValue
  },
  set (value) {
    return emit('update:modelValue', value)
  }
})

const ParagraphLimiter = Extension.create({
  name: 'paragraphLimiter',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('paragraphLimiter'),
        filterTransaction: (transaction) => {
          if (!transaction.docChanged) return true
          const nodeCount = transaction.doc?.content?.childCount || 0
          if (nodeCount > 4) return false
          return true
        }
      })
    ]
  },
})

const linkMenu = ref(false)
const linkData = ref({url: '' })

const editor = useEditor({
  content: model.value || props.content || '',
  editable: !props.display,
  onUpdate: ({editor}) => {
    if (!props.display) {
      model.value = editor.getJSON()
    }
  },
  extensions: [
    Document,
    Text,
    Dropcursor,
    ParagraphLimiter,
    Paragraph,
    Bold,
    Italic,
    Link.configure({ openOnClick: false }),
    CharacterCount.configure({
      limit: 300,
    }),
  ],
})

defineExpose({ editor })

const addLink = () => {
  if (linkData.value.url) {
    editor.value.chain().focus().extendMarkRange('link').setLink({ href: linkData.value.url, target: '_blank' }).run()
    resetAddLink()
  }
}

const resetAddLink = () => {
  linkData.value.url = ''
  linkMenu.value = false
}

watch(() => props.modelValue, (val) => {
  editor.value.commands.setContent(val)
})

watch(() => props.content, (val) => {
  editor.value.commands.setContent(val)
})

</script>

<template>
  <div v-if="editor" class="editor-wrapper color-black" :class="{'display-only': display}">
    <div>
      <editor-content :editor="editor" />
    </div>
    <div  v-if="!display" class="menu flex flex-column flex-md-row justify-space-between">
      <div class="flex">
        <button
          class="menu-button flex mr-2"
          :class="{'active': editor.isActive('bold')}"
          @click="editor.chain().focus().toggleBold().run()"
          type="button"
          :aria-pressed="editor.isActive('bold')"
        >
          <BoldIcon aria-hidden/>
          <span class="sr-only">
            {{ $t('admin.news.srOnly.bold') }}
          </span>
        </button>

        <button
          class="menu-button flex mr-2"
          :class="{'active': editor.isActive('italic')}"
          @click="editor.chain().focus().toggleItalic().run()"
          type="button"
          :aria-pressed="editor.isActive('italic')"
        >
          <ItalicIcon aria-hidden/>
          <span class="sr-only">
            {{ $t('admin.news.srOnly.italic') }}
          </span>
        </button>
        <!-- LINK -->
        <v-menu
          v-if="!editor.isActive('link')"
          v-model="linkMenu"
          transition="slide-y-transition"
          :close-on-content-click="false"
        >
          <template v-slot:activator="{ props }">
            <button
              v-bind="props"
              class="menu-button flex"
              type="button"
            >
              <LinkIcon aria-hidden/>
              <span class="sr-only">{{ $t('admin.news.srOnly.link') }}</span>
            </button>
          </template>
          <div class="menu-link">
            <v-form @submit.prevent="addLink">
              <input-text
                autofocus
                class="mt-5"
                :label="$t('admin.news.labels.url')"
                v-model="linkData.url"
                :placeholder="$t('admin.news.labels.urlPlaceholder')"
              />
              <div class="flex justify-end align-center mt-5">
                <Button
                  type="submit"
                  class="mr-8"
                  :text="$t('admin.news.form.add')"
                  variant="black"
                  @click="addLink"
                  compact
                />
                <Button
                  @click="resetAddLink"
                  variant="white"
                  compact
                >
                  {{ $t("admin.news.form.cancel") }}
                </Button>
              </div>
            </v-form>
          </div>
        </v-menu>
        <button
          v-else
          class="menu-button flex active"
          :class="{'active': editor.isActive('italic')}"
          @click="editor.chain().focus().unsetLink().run()"
          type="button"
        >
          <LinkIcon aria-hidden/>
          <span class="sr-only">{{ $t('admin.news.srOnly.unlink') }}</span>
        </button>
      </div>
      <div class="align-md-self-center mt-4 mt-md-0 color-grey-4">
        {{ $t('admin.news.limitInfo') }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @import "../../styles/_fonts.scss";

  .display-only {
    :deep(.ProseMirror) {
      border: none;
      img.ProseMirror-selectednode {
        outline: none !important;
      }
    }
  }
  .editor-wrapper:not(.display-only) {
    border: 1px solid $color-primary-20;

    &:focus-within {
      border: 1px solid $color-grey-2;
    }
    :deep(.ProseMirror) {
      padding: 24px 16px;
    }
  }
  .editor-wrapper {
    :deep(.ProseMirror) {
      outline: none;
      min-height: 130px;
      overflow-y: auto;

      p {
        @extend .font-type-md-b1;
        @extend .font-type-sm-b2;
        color: $color-primary-100
      }

      a {
        color: $color-black;
        text-decoration: underline;
      }
    }
  }
.menu {
  border-top: 1.5px solid $color-primary-5;
  margin: 0 16px 24px 16px;
  padding-top: 24px;

  &-link {
    width: 400px;
    background-color: #ffffffff;
    filter: drop-shadow(0 0 28px #0C2C5C30);
    padding: 24px;
  }

  &-button {
    padding: 8px 12px;
    background-color: white;
    box-shadow: 0px 0px 40px 0px #0000000F;
    border: 0.5px solid white;

    :deep(path) {
      stroke: $color-grey-3;
    }

    &:hover {
      border: 0.5px solid $color-grey-3;
    }
    &.active {
      border: 0.5px solid $color-primary-100;;
      background-color: $color-primary-100;

      :deep(path) {
        stroke: white;
      }
      :deep(rect) {
        fill: $color-primary-100;
      }
    }
  }
}
</style>