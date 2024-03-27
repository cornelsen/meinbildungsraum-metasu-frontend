<script setup>
import { ref, watch, onMounted } from 'vue'
import { service} from '@/helpers/api'
import { useDisplay } from 'vuetify'
import Button from '@/components/Button/Button.vue'
import Editor from '@/components/Editor/Editor.vue'
import DeleteNewsModal from './DeleteNewsModal.vue'
import ModifyNewsModal from './ModifyNewsModal.vue'
import Loader from '@/components/Loader/Loader.vue'
import Pagination from '@/components/Pagination/Pagination.vue'
import { getAuthorizationData } from '@/stores/authorization'
import { useI18n } from 'vue-i18n'

const MAX_NEWS_PER_PAGE = 10

const { locale } = useI18n()
const { authorized, isAdmin } = getAuthorizationData()
const { mdAndUp } = useDisplay()

const auth = ref(false)

const loader = ref(false)

const removeDialog = ref(false)
const modifyDialog = ref(false)
const modifyDialogMode = ref('NEW')

const newsToRemove = ref(null)
const newsToEdit = ref(null)

const errorSnackbar = ref(false)
const successSnackbar = ref(false)

const newsList = ref([])
const totalElements = ref(0)
const page = ref(1)

const fetchNewsList = async () => {
  if (!auth.value) {
    loader.value = true
  }
  try {
    const { data } = await service.get('/news', {
      params: {
        page: page.value - 1,
        size: MAX_NEWS_PER_PAGE,
        sort: ['createdAt', 'desc']
      }
    })
    newsList.value = data.content
    totalElements.value = data.totalElements
    auth.value = true
  } catch (e) {
    console.log('error %o', e)
    if (e.response.status === 401) {
      auth.value = false
    }
  }
  loader.value = false
}

const editNews = (news) => {
  newsToEdit.value = { ...news }
  modifyDialogMode.value = 'EDIT'
  modifyDialog.value = true
  fetchNewsList()
}

const addNewNews = () => {
  modifyDialogMode.value = 'NEW'
  modifyDialog.value = true
  fetchNewsList()
}

const removeNews = (news) => {
  newsToRemove.value = news
  removeDialog.value = true
  fetchNewsList()
}

watch(() => isAdmin.value, (val) => {
  if(val) fetchNewsList()
})

watch(() => page.value, fetchNewsList)

onMounted(() => {
  if (authorized.value && isAdmin.value) fetchNewsList()
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
    <DeleteNewsModal
      v-model="removeDialog"
      :news="newsToRemove"
      @error="() => errorSnackbar = true"
      @removed="() => { successSnackbar = true; fetchNewsList() }"
    />

    <ModifyNewsModal
      v-model="modifyDialog"
      :pNews="newsToEdit"
      :mode="modifyDialogMode"
      @error="() => errorSnackbar = true"
      @added="() => { successSnackbar = true; fetchNewsList() }"
      @edited="() => { successSnackbar = true; fetchNewsList() }"
    />

    <div class="limited-width pl-4 pr-4 pl-md-12 pr-md-12 color-black mb-8 mb-md-80">
      <div class="flex justify-space-between align-end mt-10 mb-6 mt-md-10 mb-md-10 flex-wrap">
        <div>
          <h2 class="header-md-6 header-sm-2 color-black">
            {{ $t('admin.news.header') }}
          </h2>
          <div class="header-md-7 font-type-sm-b2 color-grey-4 ml-md-4 d-block d-md-inline-block">
            <template v-if="totalElements === 0">0</template>
            <template v-else>
              {{ totalElements !== 0 ? page * MAX_NEWS_PER_PAGE - MAX_NEWS_PER_PAGE + 1 : 0}}-{{ page * MAX_NEWS_PER_PAGE > totalElements ? totalElements : page * MAX_NEWS_PER_PAGE }}
              {{ $t('search.of') }} {{ totalElements }}
            </template>
          </div>
        </div>
        <div class="align-self-start">
          <Button
            @click="addNewNews"
            :variant="mdAndUp ? 'black' : 'white'"
            :text="$t('admin.news.addNewNews')"
          />
        </div>
      </div>
      <div class="flex flex-wrap news">
        <div v-for="(entry) in newsList" :key="entry.id" class="news-element">
          <div class="news-element-info">
            <div>
              <div class="flex justify-space-between">
                <div class="header-md-6 header-sm-5 mb-6">
                  {{ locale === 'de' ? entry.titleDe : entry.titleEn }}
                </div>
                <div class="flex mr-n2 mr-md-0">
                  <button
                    type="button"
                    @click.prevent="() => removeNews(entry)"
                    class="d-block mr-5 mr-md-6 delete link"
                  >
                    <span class="sr-only">
                      {{
                        $t('admin.news.remove')
                      }}
                    </span>
                  </button>
                  <button
                    type="button"
                    @click.prevent="() => editNews(entry)"
                    class="d-block edit link"
                  >
                    <span class="sr-only">
                      {{
                        $t('admin.news.edit')
                      }}
                    </span>
                  </button>
                </div>
              </div>
              <div>
                <Editor
                  :content="locale === 'de' ? entry.contentDe : entry.contentEn"
                  display
                />
              </div>
              <div class="mt-6 font-b5 font-type-sm-b4 color-grey-4">{{ entry.createdAt }}</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="totalElements > MAX_NEWS_PER_PAGE">
        <Pagination
          v-model="page"
          :maxPages="totalElements ? Math.ceil(totalElements / MAX_NEWS_PER_PAGE) : 1"
        />
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
  .news {
    margin-top: 62px;
    gap: 48px;
  }
  .news-element {
    flex: 0 1 calc(50% - 24px);
    background-color: $color-grey-8;

    &-info {
      padding: 32px 48px;
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
      background-image: url('/img/Pencil.svg');
      &:hover, &:focus {
        outline: none;
        background-image: url('/img/PencilActive.svg');
      }
    }
  }

  @media (max-width: $MAX-WIDTH-MOBILE) {
    .news {
      gap: 16px;
      margin-top: 0;

      &-element {
        flex: 0 0 100%;
        &-info {
          padding: 20px;
        }
      }
      .edit, .delete {
        width: 32px;
        height: 32px;
        background-size: 32px;
      }
    }
  }
</style>
