<script setup>
import { ref, watch, onMounted } from 'vue'
import { service, getAttachmentUrlById } from '@/helpers/api'
import { useDisplay } from 'vuetify'
import ArrowRightIcon from '@/assets/icons/Side=Right.svg'
import Button from '@/components/Button/Button.vue'
import DeleteArticleModal from './DeleteArticleModal.vue'
import ModifyArticleModal from './ModifyArticleModal.vue'
import Loader from '@/components/Loader/Loader.vue'
import { getAuthorizationData } from '@/stores/authorization'

const { authorized, isAdmin } = getAuthorizationData()
const { mdAndUp } = useDisplay()
const auth = ref(false)

const loader = ref(false)

const removeDialog = ref(false)
const modifyDialog = ref(false)
const modifyDialogMode = ref('NEW')

const articleToRemove = ref(null)
const articleToEdit = ref(null)

const errorSnackbar = ref(false)
const successSnackbar = ref(false)

const articlesList = ref([])

const fetchArticlesList = async () => {
  if (!auth.value) {
    loader.value = true
  }
  try {
    const { data } = await service.get('/articles', {
      params: {
        sort: ['createdAt', 'desc']
      }
    })

    articlesList.value = data.map(el => (
      { ...el, focus: ref(false) }
    ))

    auth.value = true
  } catch (e) {
    console.log('error %o', e)
    if (e.response.status === 401) {
      auth.value = false
    }
  }
  loader.value = false
}

const editArticle = (article) => {
  articleToEdit.value = { ...article }
  modifyDialogMode.value = 'EDIT'
  modifyDialog.value = true
}

const addNewArticle = () => {
  modifyDialogMode.value = 'NEW'
  modifyDialog.value = true
}

const removeArticle = (article) => {
  articleToRemove.value = article
  removeDialog.value = true
}

watch(() => isAdmin.value, (val) => {
  if(val) fetchArticlesList()
})

onMounted(() => {
  if (authorized.value && isAdmin.value) fetchArticlesList()
})

</script>

<template>
  <div v-if="auth">
    <v-snackbar
        v-model="errorSnackbar"
        location="top"
        position="fixed"
        variant="flat"
        color="#D4323C"
        timeout="2000"
      >
      <div class="font-type-b5">
        {{ $t('admin.error') }}
      </div>
    </v-snackbar>
    <v-snackbar
        v-model="successSnackbar"
        location="top"
        position="fixed"
        variant="flat"
        color="#2A823D"
        timeout="2000"
      >
      <div class="font-type-b5">
        {{ $t('admin.success') }}
      </div>
    </v-snackbar>
    <DeleteArticleModal
      v-model="removeDialog"
      :article="articleToRemove"
      @error="errorSnackbar = true"
      @removed="successSnackbar = true; fetchArticlesList()"
    />
    <ModifyArticleModal
      v-model="modifyDialog"
      :pArticle="articleToEdit"
      :mode="modifyDialogMode"
      @error="errorSnackbar = true"
      @added="successSnackbar = true; fetchArticlesList()"
      @edited="successSnackbar = true; fetchArticlesList()"
    />

    <div class="limited-width pl-4 pr-4 pl-md-12 pr-md-12 color-black mb-md-80">
      <div class="flex justify-space-between align-end mt-10 mb-10 flex-wrap">
        <div>
          <h2 class="header-md-6 header-sm-2 color-black">
            {{ $t('admin.articles.header') }}
          </h2>
          <div class="header-md-7 font-type-sm-b2 color-grey-4 ml-md-4 d-block d-md-inline-block">
            {{ articlesList.length }} {{ articlesList.length  === 1 ? $t('search.result') : $t('search.results') }}
          </div>
        </div>
        <div class="align-self-start">
          <Button
            @click="addNewArticle"
            :variant="mdAndUp ? 'black' : 'white'"
            :text="$t('admin.articles.addNewArticle')"
          />
        </div>
      </div>

      <div class="articles flex flex-wrap justify-space-between align-center flex-column flex-md-row">
        <div
          v-for="(entry) in articlesList"
          :key="entry.id" class="article-wrapper"
        >
            <span class="article-tile" tabindex="0">
              <div
                class="article-tile-image"
                :style="{ 'background-image': `url(${getAttachmentUrlById(entry.croppyImageId)})` }"
              >
                <div
                  class="flex justify-center article-tile-image-cover"
                >
                  <button
                    type="button"
                    class="d-block mr-4 delete link align-self-center"
                    @click="() => removeArticle(entry)"
                  >
                    <span class="sr-only">
                      {{
                        $t('admin.articles.remove')
                      }}
                    </span>
                  </button>
                  <button
                    type="button"
                    class="d-block edit link align-self-center"
                    @click="() => editArticle(entry)"
                  >
                    <span class="sr-only">
                      {{
                        $t('admin.articles.edit')
                      }}
                    </span>
                  </button>
                </div>

              </div>
              <div class="article-tile-text font-type-b1">
                <div class="title word-break-all">
                  {{ entry.title }}
                </div>
                <div class="arrow" v-if="mdAndUp">
                  <ArrowRightIcon class="white-icon" aria-hidden="true"/>
                </div>
                <div
                  v-else
                  class="flex justify-center"
                >
                  <button
                    type="button"
                    class="d-block mr-4 delete link align-self-center"
                    @click="() => removeArticle(entry)"
                  >
                    <span class="sr-only">
                      {{
                        $t('admin.articles.remove')
                      }}
                    </span>
                  </button>
                  <button
                    type="button"
                    class="d-block edit link align-self-center"
                    @click="() => editArticle(entry)"
                  >
                    <span class="sr-only">
                      {{
                        $t('admin.articles.edit')
                      }}
                    </span>
                  </button>
                </div>
              </div>
            </span>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <Loader v-if="loader"/>
    <div v-else class="color-black text-center mt-15 header-8">
      {{ $t("admin.noCredentials") }}
    </div>
  </div>
</template>

<style lang="scss" scoped>

  .article {
    margin: 80px 48px 62px 48px;

    &-wrapper {
      display: flex;
      padding: 46px;
      background-color: $color-grey-8;
    }

    &-tile {
      display: inline-block;
      overflow: hidden;
      width: 384px;
      background-color: #FFFFFFFF;

      &:hover, &:focus-within {
        .article-tile-image-cover {
          display: flex;
        }
      }

      &-image {
        background-size: contain;
        transition: transform .3s ease-out;
        width: 100%;
        height: 384px;

        &-cover {
          display: none;
          height: 100%;
          width: 100%;
          background-color: #1A1A1AD9;
        }
      }

      &-text {
        display: flex;
        position: relative;
        z-index: 1;
        height: 64px;
        box-sizing: content-box;
        justify-content: space-between;
        background-color: $color-black;
        padding: 16px;

        .title {
          color: #FFFFFFFF;
        }
        .arrow {
          transition: transform .3s ease-out;
          margin-left: 16px;
          width: 32px;
          height: 32px;
          align-self: center;
        }
      }
    }
  }
  .delete {
      width: 40px;
      height: 40px;
      background-image: url('/img/Bin.svg');

      &:hover, &:focus {
        outline: none;
        background-image: url('/img/BinActive.svg');
      }
    }
  .edit {
    width: 40px;
    height: 40px;
    background-image: url('/img/PencilWhite.svg');

    &:hover, &:focus {
      outline: none;
      background-image: url('/img/PencilActive.svg');
    }
  }

  .green {
    color: $color-success;
  }
  .red {
    color: $color-error;
  }

  @media (max-width: $MAX-WIDTH-MOBILE) {
    .articles {
      gap: 24px;
      margin-bottom: 32px;
    }
    .article {

      &-wrapper {
        background-color: transparent;
        padding: 0;
      }

      &-tile {
        width: 343px;

        &-image {
          height: 343px;
        }

        &:hover, &:focus-within {
          .article-tile-image-cover {
            display: none;
          }
        }
      }
    }
    .delete {
      width: 40px;
      height: 40px;
      background-image: url('/img/BinActive.svg');
      &:hover, &:focus {
        outline: none;
        background-image: url('/img/Bin.svg');
      }
    }
    .edit {
      width: 40px;
      height: 40px;
      background-image: url('/img/PencilWhite.svg');
      &:hover, &:focus {
        outline: none;
        background-image: url('/img/PencilWhite.svg');
      }
    }
  }
</style>
