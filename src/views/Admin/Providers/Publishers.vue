<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { service, getAttachmentUrlById } from '@/helpers/api'
import Button from '@/components/Button/Button.vue'
import SearchIcon from '@/assets/icons/Search.svg'
import ShareIcon from '@/assets/icons/Share.svg'
import ChevronIconUp from '@/assets/icons/Type=Down.svg'
import ChevronIconDown from '@/assets/icons/Type=Up.svg'
import DeletePublisherModal from './DeletePublisherModal.vue'
import ModifyPublisherModal from './ModifyPublisherModal.vue'
import Loader from '@/components/Loader/Loader.vue'
import PublisherTile from '@/components/Publisher/PublisherTile.vue'
import { getAuthorizationData } from '@/stores/authorization'

const { authorized, isAdmin } = getAuthorizationData()
const { mdAndUp } = useDisplay()
const router = useRouter()
const auth = ref(false)

const loader = ref(false)

const checkboxFilter = ref(['ACTIVE', 'PENDING'])

const removeDialog = ref(false)
const modifyDialog = ref(false)
const modifyDialogMode = ref('NEW')

const publisherToRemove = ref(null)
const publisherToEdit = ref(null)

const errorSnackbar = ref(false)
const successSnackbar = ref(false)

const providersList = ref([])
const publisherFilterText = ref('')

const publishersFiltered = computed(() => {
  if (providersList.value.length) {
    return providersList.value
      .filter(
        (entry) => providersList.value.length
          ? Object.keys(providersList.value[0])
            .some(key => {
              if (key !== 'status') {
                if (checkboxFilter.value.includes(entry.status)) {
                  return ('' + entry[key]).toLowerCase().includes(publisherFilterText.value.toLowerCase())
                }
              }
              return false
            })
          : true
      )
  }
  return []
})

const fetchPublishersList = async () => {
  if (!auth.value) {
    loader.value = true
  }
  try {
    const { data } = await service.get('/admin/publisher')
    providersList.value = data.map(el => ({ ... el, collapsed: true }))
    auth.value = true
  } catch (e) {
    console.log('error %o', e)
    if (e.response.status === 401) {
      auth.value = false
    }
  }
  loader.value = false
}

const editPublisher = (publisher) => {
  publisherToEdit.value = { ...publisher }
  modifyDialogMode.value = 'EDIT'
  modifyDialog.value = true
}

const addNewPublisher = () => {
  modifyDialogMode.value = 'NEW'
  modifyDialog.value = true
}

const removePublisher = (provider) => {
  publisherToRemove.value = provider
  removeDialog.value = true
}

const removedPublisher = (id) => {
  const item = providersList.value.find(publisher => publisher.id === id)
  const elIndex = providersList.value.indexOf(item)
  if (elIndex > -1) {
    providersList.value.splice(elIndex, 1)
  }
  successSnackbar.value = true
}

const editedPublisher = (publisher) => {
  const toUpdate = providersList.value.find(p => p.id === publisher.id)
  if (toUpdate) {
    Object.assign(toUpdate, { ...publisher })
  }
  successSnackbar.value = true
}

const activatePublisher = async (publisher) => {
  try {
    await service.post(`/admin/publisher/${publisher.id}/accept`)
    publisher.status = 'ACTIVE'
  } catch (e) {
    errorSnackbar.value = true
    console.log('error %o', e)
  }
}


watch(() => isAdmin.value, (val) => {
  if(val ) fetchPublishersList()
})
onMounted(() => {
  if (authorized.value && isAdmin.value) fetchPublishersList()
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
    <DeletePublisherModal
      v-model="removeDialog"
      :publisher="publisherToRemove"
      @error="() => errorSnackbar = true"
      @removed="removedPublisher"
    />
    <ModifyPublisherModal
      v-model="modifyDialog"
      :provider="publisherToEdit"
      :mode="modifyDialogMode"
      @error="() => errorSnackbar = true"
      @added="() => { successSnackbar = true; fetchPublishersList() }"
      @edited="editedPublisher"
    />

    <div class="mobile-search d-md-none">
      <div class="mobile-search-container ">
        <div class="form-input">
          <v-text-field
            class="input filter-input"
            :placeholder="$t('admin.providers.labels.searchHere')"
            :items="[]"
            v-model="publisherFilterText"
            :append-inner-icon="SearchIcon"
            variant="underlined"
            density="default"
            hide-details
            persistent-placeholder
            autofocus
          >
          </v-text-field>
        </div>
      </div>
    </div>
    <div class="limited-width pl-4 pr-4 pl-md-12 pr-md-12 color-black mb-md-80">
      <div class="flex justify-space-between align-end mt-md-10 mb-md-10 mt-8 mb-6 flex-wrap">
        <h2 class="header-md-6 header-sm-2 header mb-2">{{ $t('admin.providers.publishers') }}
          <div class="color-grey-4 header-md-7 font-type-sm-b2 d-block d-md-inline-block">
            <span
              v-if="publisherFilterText || checkboxFilter.length !== 2"
            >
              {{ publishersFiltered.length }} {{ $t('search.of') }}
            </span>
            {{ providersList.length }} {{ $t('search.results') }}
          </div>
        </h2>
        <div class="d-none d-md-block form-input">
          <v-text-field
            class="input filter-input"
            :placeholder="$t('admin.providers.filter')"
            :items="[]"
            v-model="publisherFilterText"
            :append-inner-icon="SearchIcon"
            variant="underlined"
            density="default"
            hide-details
            persistent-placeholder
            autofocus
          >
            <template v-slot:prepend>
              <div class="color-black input-label">
                {{ $t("search.search") }}:
              </div>
            </template>
          </v-text-field>
        </div>
        <div class="d-none d-md-flex color-black font-type-md-b5 header-sm-7 mb-4">
          <input type="checkbox" class="mr-2" id="pendingFilter" value="PENDING" v-model="checkboxFilter">
          <label for="pendingFilter" class="link">
            {{ $t('admin.providers.status.pending') }} ({{ providersList.filter(el => el.status === 'PENDING').length }})
          </label>

          <input type="checkbox" class="ml-5 mr-2" id="activeFilter" value="ACTIVE" v-model="checkboxFilter">
          <label for="activeFilter" class="link">
            {{ $t('admin.providers.status.active') }} ({{ providersList.filter(el => el.status === 'ACTIVE').length }})
          </label>
        </div>
        <div :class="{'align-self-start': !mdAndUp}">
          <Button
            @click="addNewPublisher"
            :variant="mdAndUp ? 'black' : 'white'"
            :text="$t('admin.providers.addNewPublisher')"
          />
        </div>
      </div>
      <div class="d-flex d-md-none color-black font-type-md-b5 header-sm-7 mb-6">
        <input type="checkbox" class="mr-2" id="pendingFilter" value="PENDING" v-model="checkboxFilter">
        <label for="pendingFilter" class="link">
          {{ $t('admin.providers.status.pending') }} ({{ providersList.filter(el => el.status === 'PENDING').length }})
        </label>

        <input type="checkbox" class="ml-5 mr-2" id="activeFilter" value="ACTIVE" v-model="checkboxFilter">
        <label for="activeFilter" class="link">
          {{ $t('admin.providers.status.active') }} ({{ providersList.filter(el => el.status === 'ACTIVE').length }})
        </label>
      </div>
      <!-- MOBILE -->
      <div v-for="(provider) in publishersFiltered" :key="`m-${provider.id}`" class="publisher-mobile d-md-none">
        <div
          :aria-controls="`section-${provider.id}`"
          :aria-expanded="!provider.collapsed"
          @click="provider.collapsed = !provider.collapsed"
          class="flex justify-space-between link mb-5"
        >
          <div class="header-sm-2">{{ provider.name }}</div>
          <div>
            <ChevronIconUp v-if="provider.collapsed" aria-hidden="true"/>
            <ChevronIconDown v-else aria-hidden="true"/>
            <span class="sr-only">
              {{ provider.collapsed ? $t('admin.providers.expandDetails') : $t('admin.providers.collapseDetails')}}
            </span>
          </div>
        </div>
        <div class="flex justify-space-between">
          <div v-if="provider.status === 'ACTIVE'">
            <div
              class="circle mr-2"
              :class="{ 'active': provider.status === 'ACTIVE', 'pending': provider.status === 'PENDING'}"
            ></div>
            <span class="header-sm-7"
            :class="{ 'green': provider.status === 'ACTIVE', 'red': provider.status === 'PENDING'}"
            >
              {{ provider.status === "PENDING" ? $t('admin.providers.status.pending') : $t('admin.providers.status.active') }}
            </span>
          </div>
          <div v-else>
            <Button
              @click="activatePublisher(provider)"
              type="button"
              class="mr-8"
              :text="$t('admin.providers.form.activate')"
              variant="black"
            />
          </div>
          <div class="flex">
            <button
              type="button"
              @click.prevent="() => removePublisher(provider)"
              class="d-block mr-4 delete"
            >
              <span class="sr-only">
                {{
                  $t('admin.providers.remove')
                }}
              </span>
            </button>
            <button
              type="button"
              @click.prevent="() => editPublisher(provider)"
              class="d-block edit"
            >
              <span class="sr-only">
                {{
                  $t('admin.providers.edit')
                }}
              </span>
            </button>
          </div>
        </div>
        <div class="publisher-mobile-logo mt-6">
          <img :src="getAttachmentUrlById(provider.croppyImageId)" :alt="provider.name"/>
        </div>
        <div
          :id="`section-${provider.id}`"
          :class="{'d-none': provider.collapsed}"
          :aria-hidden="provider.collapsed"
        >
            <PublisherTile :publisher="provider"/>
            <Button
                role="link"
                variant="white"
                @click="router.push(`/publisher/search/${provider.id}`)"
                :text="$t('publisher.goToMaterials')"
                :iconRight="ShareIcon"
              >
            </Button>
      </div>
      </div>
      <!-- PC -->
      <div v-for="(provider) in publishersFiltered" :key="provider.id" class="publisher d-none d-md-block ">
        <div class="publisher-info">
          <div class="flex justify-space-between flex-wrap">
            <div class="flex">
              <div class="mr-12">
                <div class="font-type-b3 mb-2 uppercase"> {{ $t('admin.providers.labels.name') }}</div>
                <div class="font-type-b5 mt-2"> {{ provider.name }} </div>
              </div>
              <div v-if="provider.status === 'ACTIVE'">
                <div class="align-self-center font-type-b3 uppercase">
                  {{ $t('admin.providers.labels.status') }}
                </div>
                <div class="mt-2">
                  <div class="circle mr-2 active" />
                  <span class="font-type-b5 green">
                    {{ $t('admin.providers.status.active') }}
                  </span>
                </div>
              </div>
              <div v-else>
                <Button
                  @click="activatePublisher(provider)"
                  type="button"
                  class="mr-8"
                  :text="$t('admin.providers.form.activate')"
                  variant="black"
                />
              </div>
            </div>
            <div class="align-self-center">
              <div class="flex flex-wrap flex flex-wrap justify-space-between">
              <button
                type="button"
                @click.prevent="() => editPublisher(provider)"
                class="d-block mr-6 edit"
              >
                <span class="sr-only">
                  {{
                    $t('admin.providers.edit')
                  }}
                </span>
              </button>
              <button
                type="button"
                @click.prevent="() => removePublisher(provider)"
                class="d-block mr-6 delete"
              >
                <span class="sr-only">
                  {{
                    $t('admin.providers.remove')
                  }}
                </span>
              </button>
              </div>
            </div>
          </div>
        </div>
        <div class="publisher-divider"/>
        <PublisherTile :publisher="provider"/>
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
  header {
    flex-basis: 30%;
    flex-shrink: 0;
  }

  .publisher {
    margin-top: 48px;
    background-color: $color-grey-6;

    &-info {
      padding: 48px;
    }

    &-divider {
      margin-left: 48px;
      margin-right: 48px;
      border-bottom: 2px solid $color-primary-80;
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
    background-image: url('/img/Pencil.svg');
    &:hover, &:focus {
      outline: none;
      background-image: url('/img/PencilActive.svg');
    }
  }

  .green {
    color: $color-success;
  }

  .filter-input {
    min-width: 250px;
    .input-label {
      margin-top: 18px;
    }
  }

  .circle {
    height: 10px;
    width: 10px;
    border-radius: 50%;
    display: inline-block;
    &.active {
      background-color: $color-success;
    }
  }

  .mobile-search {
    background-color: $color-primary-100;
    padding: 16px;

    &-container {
      background-color: #FFF;
      padding: 20px;
    }
  }

  .publisher-mobile {
    background-color: $color-grey-6;
    padding: 16px;
    margin-bottom: 24px;

    &-logo {
      box-sizing: content-box;
      width: 240px;
      height: 120px;
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

    .edit, .delete {
      width: 32px;
      height: 32px;
      background-size: 32px;
    }
  }
</style>
