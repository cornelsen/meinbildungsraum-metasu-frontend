<script setup>
import { ref, onBeforeMount, watchEffect, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCookies } from 'vue3-cookies'
import { useDisplay } from 'vuetify'
import SwitchOffIcon from '@/assets/icons/Right=No.svg'
import SwitchOnIcon from '@/assets/icons/Right=Yes.svg'
import ProfileIcon from '@/assets/icons/Profile.svg'
import HeartIcon from '@/assets/icons/Heart.svg'
import ArrowRightIcon from '@/assets/icons/Side=Right.svg'
import LogoutIcon from '@/assets/icons/Logout.svg'
import NewsIcon from '@/assets/icons/News.svg'
import CloseIcon from '@/assets/icons/Exit.svg'
import ArticlesIcon from '@/assets/icons/Articles.svg'
import ProvidersIcon from '@/assets/icons/Providers.svg'
import ChevronIcon from '@/assets/icons/Type=Down-white.svg'
import Modal from '@/components/Modal/Modal.vue'
import Select from '@/components/Forms/Select.vue'
import ConnectionModal from '@/components/ConnectionModal/ConnectionModal.vue'
import HamburgerIcon from '@/assets/icons/Hamburger.svg'
import { getAuthorizationData, login } from '@/stores/authorization'
import { showQrModal } from '@/stores/qrCode'

const { locale, t } = useI18n()
const { cookies } = useCookies()
const { mdAndUp } = useDisplay()

const changeLanguage = (lang) => {
  locale.value = lang
  cookies.set('lang', locale.value)
}

const { authorized, firstName, lastName, email, isAdmin, firstLogin, hasDwRelation, dataWalletStatus } = getAuthorizationData()

const toggleLanguage = () => {
  changeLanguage(locale.value === 'de' ? 'en' : 'de')
}

watchEffect(() => {
  if (firstLogin.value && dataWalletStatus.value !== 'ACTIVE') {
    showQrModal()
  }
})

const hamburgerMenuShow = ref(false)
const profileMenuShow = ref(false)
const pcMenuOpen = ref(false)

const mobileLocales = computed(() => {
  return [{ label:  t('topBar.menu.de'), key: 'de'}, { label:  t('topBar.menu.en'), key: 'en'}]
})
const mobileLocale = computed(() => [locale.value])
const logoutUrl = `${window.origin}/api/logout`

onBeforeMount(() => {
  const lang = cookies.get('lang')
  if (lang === 'de') locale.value = 'de'
  else if (lang === 'en') locale.value = 'en'
  else {
    locale.value = 'de'
    cookies.set('lang', locale.value)
  }
})
const changeFocusToId = (id) => {
  document.querySelector(id)?.focus()
}
</script>

<template>
  <div class="top-bar">
    <ConnectionModal />
    <Modal
      v-if="!mdAndUp"
      v-model="hamburgerMenuShow"
      fullscreen
      :scrim="false"
      transition="dialog-top-transition"
    >
      <div class="hamburger-menu">
        <div class="hamburger-menu-toolbar d-flex justify-space-between align-center">
          <div class="logo flex">
            <router-link to="/" class="d-block mt-2 outline-w">
              <img src="/logo.svg" alt="metasu"/>
            </router-link>
            <div class="hamburger-menu-toolbar-separator">
              <div class="separator"></div>
            </div>
            <div class="blue-select">
              <Select
                class="blue-select"
                :items="mobileLocales"
                variant="blue"
                hide-selected
                noEmpty
                :aria-label="$t('search.filters.sortBy')"
                v-model="mobileLocale"
                @update:modelValue="(val) => changeLanguage(val[0])"
              />
            </div>
          </div>
          <div>
            <button type="button" class="link outline-w" @click="hamburgerMenuShow = false">
              <CloseIcon class="link white-icon outline-w" aria-hidden="true"/>
              <span class="sr-only">{{ $t('modal.close') }}</span>
            </button>
          </div>
        </div>
        <div class="hamburger-menu-content">
          <div>
            <router-link to="/about" class="flex justify-space-between mb-10 outline-w" @click="hamburgerMenuShow = false">
              <div class="font-button2 uppercase">
                {{ $t('topBar.menu.aboutPlatform') }}
              </div>
              <ArrowRightIcon class="link-arrow white-icon" aria-hidden="true"/>
            </router-link>
            <router-link to="/" class="flex justify-space-between mb-10 outline-w" @click="hamburgerMenuShow = false">
              <div class="font-button2 uppercase">
                {{ $t('topBar.menu.library') }}
              </div>
              <ArrowRightIcon class="link-arrow white-icon" aria-hidden="true"/>
            </router-link>
            <router-link to="/" class="flex justify-space-between mb-10 outline-w" @click="hamburgerMenuShow = false">
              <div class="font-button2 uppercase">
                {{ $t('topBar.menu.fa') }}
              </div>
              <ArrowRightIcon class="link-arrow white-icon" aria-hidden="true"/>
            </router-link>
            <div v-if="authorized" class="hamburger-menu-content-separator mb-10"></div>
            <a :href="logoutUrl" class="flex justify-space-between mb-10  outline-w">
              <div class="font-button2 uppercase">
                {{ $t('topBar.menu.logout') }}
              </div>
              <LogoutIcon class="link-arrow white-icon" aria-hidden="true"/>
            </a>
          </div>
        </div>
      </div>
    </Modal>
    <!-- PROFILE MENU MOBILE -->
    <Modal
      v-if="!mdAndUp"
      v-model="profileMenuShow"
      fullscreen
      :scrim="false"
      transition="dialog-top-transition"
    >
      <div class="profile-mobile-menu">
        <div class="profile-mobile-menu-toolbar d-flex justify-space-between align-center">
          <div class="capitalize header-sm-2 color-black">
            {{ $t('topBar.menu.mobileHeader') }}
          </div>
          <div>
            <button type="button" class="link" @click="profileMenuShow = false">
              <CloseIcon class="link black-icon" aria-hidden="true"/>
              <span class="sr-only">{{ $t('modal.close') }}</span>
            </button>
          </div>
        </div>
        <div class="profile-mobile-menu-content">
          <div>
            <div class="profile-mobile-menu-content-details">
              <div class="color-black header-sm-4 flex">
                <div>
                  {{ firstName }} {{ lastName }}
                </div>
                <div
                  v-if="isAdmin"
                  class="profile-mobile-menu-content-badge ml-2 font-sm-button align-self-center uppercase"
                >
                  {{ $t('topBar.menu.admin') }}
                </div>
              </div>
              <div class="color-grey-4 font-type-sm-b2">{{ email }}</div>
            </div>
            <div class="profile-mobile-menu-content-separator mb-10"/>
            <router-link to="/profile" class="flex justify-space-between mb-10 color-black" @click="profileMenuShow = false">
              <div class="font-button2 uppercase">
                {{ $t('topBar.menu.goToProfile') }}
              </div>
              <ArrowRightIcon class="link-arrow black-icon" aria-hidden="true"/>
            </router-link>
            <router-link v-if="isAdmin" to="/admin/news" class="flex justify-space-between mb-10 color-black" @click="profileMenuShow = false">
              <div class="font-button2 uppercase">
                {{ $t('topBar.adminMenu.news') }}
              </div>
              <ArrowRightIcon class="link-arrow black-icon" aria-hidden="true"/>
            </router-link>
            <router-link v-if="isAdmin" to="/admin/articles" class="flex justify-space-between mb-10 color-black" @click="profileMenuShow = false">
              <div class="font-button2 uppercase">
                {{ $t('topBar.adminMenu.articles') }}
              </div>
              <ArrowRightIcon class="link-arrow black-icon" aria-hidden="true"/>
            </router-link>
            <router-link v-if="isAdmin" to="/admin/publishers" class="flex justify-space-between mb-10 color-black" @click="profileMenuShow = false">
              <div class="font-button2 uppercase">
                {{ $t('topBar.adminMenu.publishers') }}
              </div>
              <ArrowRightIcon class="link-arrow black-icon" aria-hidden="true"/>
            </router-link>
            <div class="profile-mobile-menu-content-separator mb-10"/>
            <a :href="logoutUrl" class="flex justify-space-between mb-10 color-black">
              <div class="font-button2 uppercase">
                {{ $t('topBar.menu.logout') }}
              </div>
              <LogoutIcon class="link-arrow black-icon" aria-hidden="true"/>
            </a>
          </div>
        </div>
      </div>
    </Modal>
    <div class="logo">
      <router-link to="/" class="d-block outline-w">
        <img src="/logo.svg" alt="metasu"/>
      </router-link>
    </div>
    <!-- MOBILE -->
    <nav class="menu d-md-none d-sm-block">
      <button
        type="button"
        class="link outline-w"
        role="link"
        @click="() => authorized ? profileMenuShow = true : login()"
      >
        <ProfileIcon class="white-icon mr-5" width="32" height="32" aria-hidden="true"/>
        <span class="sr-only">
          {{ authorized ? $t('topBar.menu.openProfileMenu') : $t('topBar.menu.login') }}
        </span>
      </button>
      <router-link
        v-if="authorized"
        :to="{ name: 'Profile', params: { tab: 'favorites'}}"
        class="link outline-w"
      >
        <HeartIcon class="mr-5" aria-hidden="true"/>
        <span class="sr-only">{{  $t('topBar.menu.goToFavorites') }}</span>
      </router-link>
      <button
        type="button"
        class="link outline-w"
        @click="hamburgerMenuShow = true"
      >
        <HamburgerIcon aria-hidden="true"/>
        <span class="sr-only">
          {{ $t('topBar.menu.openNavigationMenu') }}
        </span>
      </button>
    </nav>
    <!-- PC -->
    <nav class="menu d-none d-md-block">
      <ul>
        <li class="text-center uppercase" :data-label="$t('topBar.menu.aboutPlatform')">
          <router-link to="/about">
            {{ $t('topBar.menu.aboutPlatform') }}
          </router-link>
        </li>
        <li class="text-center uppercase" :data-label="$t('topBar.menu.library')">
          <router-link to="/">
          {{ $t('topBar.menu.library') }}
        </router-link></li>
        <li class="text-center uppercase" :data-label="$t('topBar.menu.fa')">
          <a href="">
            {{ $t('topBar.menu.fa') }}
          </a>
        </li>
        <li class="separator"></li>
        <li
          class="menu-icons"

        >
          <div
            role="group"
            aria-labelledby="lang-label"
          >
            <span id="lang-label" class="sr-only">{{ $t('topBar.menu.srOnly.langLabel') }}</span>
            <span
              id="lang-de_radio"
              tabindex="0"
              role="radio"
              :aria-checked="locale === 'de'"
              class="link language-selector outline-w"
              :class="{active: locale === 'de'}"
              @click="changeLanguage('de')"
              @keydown.space.enter.prevent="changeLanguage('de')"
              @keydown.right.down.prevent="changeLanguage('en'); changeFocusToId('#lang-en_radio')"
              aria-labelledby="lang-de"
            >
              <span id="lang-de" class="sr-only">{{ $t('topBar.menu.srOnly.de') }}</span>
              {{ $t('topBar.menu.de') }}
            </span>
            <span class="toggle" aria-hidden="true">
              <SwitchOffIcon v-if="locale === 'de'" @click="toggleLanguage"/>
              <SwitchOnIcon v-if="locale === 'en'" @click="toggleLanguage"/>
            </span>
            <span
              id="lang-en_radio"
              tabindex="0"
              role="radio"
              :aria-checked="locale === 'en'"
              class="link language-selector outline-w"
              :class="{active: locale === 'en'}"
              @click.prevent="() => changeLanguage('en')"
              @keydown.space.enter.prevent="changeLanguage('en')"
              @keydown.left.up.prevent="changeLanguage('de'); changeFocusToId('#lang-de_radio')"
              aria-labelledby="lang-en"
            >
              <span id="lang-en" class="sr-only">{{ $t('topBar.menu.srOnly.en') }}</span>
              {{ $t('topBar.menu.en') }}
            </span>
          </div>
        </li>
        <li class="menu-profile">
          <template v-if="authorized">
            <v-menu
              v-model="pcMenuOpen"
              transition="slide-y-transition"
            >
              <template v-slot:activator="{ props }">
                <button v-bind="props" class="flex link outline-w menu-profile-link">
                  <div>
                    {{ hasDwRelation || isAdmin ? firstName : $t('topBar.menu.userNamePlaceholder')}}
                  </div>
                  <ChevronIcon class="ml-2"/>
                </button>
              </template>
              <div class="profile-menu" role="menu">
                <div class="profile-menu-details">
                  <div class="color-black header-7 flex">
                    <div v-if="hasDwRelation || isAdmin">
                      {{ firstName }} {{ lastName }}
                    </div>
                    <div v-else>{{ $t('topBar.menu.userNamePlaceholder') }}</div>
                    <div
                      v-if="isAdmin"
                      class="profile-menu-badge ml-2 font-button align-self-center uppercase"
                    >
                      {{ $t('topBar.menu.admin') }}
                    </div>
                  </div>
                  <div v-if="hasDwRelation || isAdmin" class="color-grey-4 font-type-b4">{{ email }}</div>
                </div>
                <div class="flex font-button w-100 py-6">
                  <router-link
                    role="menuitem"
                    to="/profile"
                    class="flex w-100 horizontal-separator color-black uppercase"
                  >
                    <ProfileIcon class="ml-6 mr-4 black-icon"/>{{ $t('topBar.menu.goToProfile') }}
                  </router-link>
                  <a :href="logoutUrl"
                    role="menuitem"
                    class="flex w-100 link color-black"
                  >
                    <LogoutIcon class="ml-10 mr-4 black-icon uppercase"/>{{ $t('topBar.menu.logout') }}
                  </a>
                </div>
                <template v-if="isAdmin">
                  <div class="profile-menu-separator w-100 mt-6 mb-6"/>
                  <div class="flex font-button w-100 color-black py-4">
                    <router-link
                      role="menuitem"
                      to="/admin/news"
                      class="flex w-100 horizontal-separator color-black uppercase"
                    >
                      <NewsIcon class="ml-6 mr-4 black-icon"/>{{ $t('topBar.adminMenu.news') }}
                    </router-link>
                    <router-link
                      role="menuitem"
                      to="/admin/articles"
                      class="flex w-100 color-black uppercase"
                    >
                      <ArticlesIcon class="ml-10 mr-4 black-icon uppercase"/>{{ $t('topBar.adminMenu.articles') }}
                    </router-link>
                  </div>
                  <div class="flex font-button w-100 color-black mt-6 py-4">
                    <router-link
                      role="menuitem"
                      to="/admin/publishers"
                      class="flex w-100 color-black uppercase"
                    >
                      <ProvidersIcon class="ml-6 mr-4 black-icon"/>{{ $t('topBar.adminMenu.publishers') }}
                    </router-link>
                    <div class="w-100"></div>
                  </div>
                </template>
              </div>
            </v-menu>
          </template>
          <template v-else>
            <button class="link user flex" @click.prevent="login">
              <ProfileIcon class="mr-6 white-icon"/>
              <div class="font-type-b4 uppercase">{{ $t('topBar.menu.login') }}
              </div>
            </button>
          </template>
        </li>
      </ul>
    </nav>
  </div>
</template>

<style lang="scss" scoped>
.top-bar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 32px 48px;
  background-color: $color-primary-100;
  font-weight: $font-weight-normal;
  color: white;

  font-size: 20px;
  line-height: 28px;

  .logo img {
    width: 112px;
  }

  .menu {
    font-size: 18px;
    line-height: 24px;

    ul {
      display: flex;
      flex-wrap: wrap;
      list-style-type: none;
      align-items: center;
      padding: 0;

      li {
        position: relative;
        margin-right: 52px;
        &.menu-icons {
          margin-top: 5px;
        }
        &::before {
          content: attr(data-label);
          font-weight: $font-weight-bold;
          visibility: hidden;
        }
        &:last-child {
          margin-right: 0;
        }
        a:not(.language-selector, .user, .menu-profile-link) {
          display: block;
          position: relative;
          top: -12px;
          line-height: 24px;
          transition: all 0.1s linear;

          &:before {
            content: '';
            transition: width 0.1s linear;
            bottom: -2px;
            height: 1.5px;
            width: 0;
            background: white;
            position: absolute;
          }

          &.router-link-active,
          &:active, &:hover, &:focus {
            outline: none;
            font-weight: $font-weight-bold;

            &:before {
              width: 100%;
            }
          }
        }
        &.separator {
          margin-top: 2px;
          height: 20px;
          border-right: 1.5px solid $color-primary-80;
        }
        .link {
          vertical-align: top;
          &.active {
            font-weight: $font-weight-bold;
          }
        }

        .toggle {
          user-select: none;
          cursor: pointer;
          margin-right: 16px;
          margin-left: 16px;
        }
      }
    }
  }
}

.profile-menu {
  background-color: #FFFFFF;
  padding: 24px;
  margin-top: 18px;
  filter: drop-shadow(0 0 28px #0C2C5C30);

  &-details {
    padding: 24px;
    margin-bottom: 24px;
    background-color: $color-grey-8;
    min-width: 451px;
  }

  &-badge {
    padding: 4px 12px;
    color: $color-success;
    background-color: #2A823D1A;
  }

  &-separator {
    border-top: 1.5px solid $color-primary-20;
  }
  .horizontal-separator {
    margin-top: 0px;
    border-right: 1.5px solid $color-primary-20;
  }
}

.menu-profile {
  &:focus {
    outline: $color-primary-100 solid 2px;
  }
}

.hamburger-menu {
  background-color: $color-primary-90;
  width: 100%;
  height: 100%;
  overflow: scroll;

  &-toolbar {
    position: sticky;
    top: 0;
    z-index: 1;
    padding: 48px 16px 24px 16px;
    background-color: $color-primary-90;

    &-separator {
      padding: 8px 16px;

      .separator {
        border-left: 2px solid $color-primary-80;
        height: 100%;
      }
    }
  }

  &-content {
    padding: 54px 16px 0 16px;

    &-separator {
      border-top: 1.5px solid $color-primary-80;
    }
  }
}

.profile-mobile-menu {
  background-color: #FFF;
  width: 100%;
  height: 100%;
  overflow: scroll;

  &-toolbar {
    position: sticky;
    top: 0;
    background-color: #FFF;
    z-index: 1;
    padding: 64px 24px 16px 24px;
  }

  &-content {
    padding: 24px 24px 0 24px;

    &-details {
      margin-bottom: 40px;
    }

    &-badge {
      padding: 4px 12px;
      color: $color-success;
      background-color: #2A823D1A;
    }

    &-separator {
      border-top: 1.5px solid $color-primary-10;
    }
  }
}

@media (max-width: $MAX-WIDTH-MOBILE) {
  .top-bar {
    padding: 48px 16px 24px 16px;
    position: sticky;
    top: 0;
    z-index: 3;
    .logo img {
      width: 108px;
      margin-left: 2px;
    }
  }
}
</style>

<style lang="scss">
/*
  .blue-select.combobox-item {
    background-color: $color-primary-90;
    color: #FFF;
    padding: 8px;
    border-bottom: 2px solid yellow;
    &:hover {
      background-color: red !important;
      color: #FFF;
    }
  }
  */
</style>