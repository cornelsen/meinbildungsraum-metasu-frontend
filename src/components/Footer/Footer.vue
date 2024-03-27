<script setup>
import FacebookIcon from '@/assets/icons/Type=Facebook.svg'
import LinkedinIcon from '@/assets/icons/Type=Linkedin.svg'
import InstagramIcon from '@/assets/icons/Type=Instagram.svg'

/*
const smallCompanies = [
  { src: '/img/companies/logo_placeholder.svg', alt: 'Cornelsen', href: 'http://cornelsen.de'},
  { src: '/img/companies/logo_placeholder.svg', alt: 'Cornelsen', href: 'http://cornelsen.de'},
  { src: '/img/companies/logo_placeholder.svg', alt: 'Cornelsen', href: 'http://cornelsen.de'},
  { src: '/img/companies/logo_placeholder.svg', alt: 'Cornelsen', href: 'http://cornelsen.de'},
  { src: '/img/companies/logo_placeholder.svg', alt: 'Cornelsen', href: 'http://cornelsen.de'}
]
*/
</script>

<template>
  <div class="footer color-black">
    <div class="limited-width d-block d-md-flex footer-container">
      <div>
        <div class="logo d-blo0ck d-flex justify-space-between">
          <router-link to="/" class="d-block color-primary-100 mt-md-2">
            <img src="/logoBlue.svg"  alt="metasu" width="112"/>
          </router-link>

          <div class="icons d-md-none d-sm-block">
            <InstagramIcon/>
            <FacebookIcon/>
            <LinkedinIcon/>
          </div>
        </div>
        <div>
          <ul class="links">
            <li>{{ $t('footer.links.about') }}</li>
            <li class="mt-4">{{ $t('footer.links.sources') }}</li>
            <li class="mt-4">{{ $t('footer.links.help') }}</li>
            <li class="mt-4">{{ $t('footer.links.contact') }}</li>
          </ul>
        </div>
        <div class="icons d-none d-md-block">
          <InstagramIcon/>
          <FacebookIcon class="ml-8"/>
          <LinkedinIcon class="ml-8"/>
        </div>
        <div class="terms ont-type-b6 d-none d-md-block">
          {{ $t('footer.links.tos') }}
        </div>
      </div>
      <div class="separator d-none d-lg-flex"></div>
      <div class="partners mt-5 mt-md-0">
        <div class="font-type-sm-b4 header-md-8">
          {{ $t('footer.text') }}
        </div>
        <div class="terms font-type-b6 d-block d-md-none mt-4">
          {{ $t('footer.links.tos') }}
        </div>
        <div class="logos">
          <div class="logos-row">
            <div
              target="_blank"
              class="logos-row-icon flex align-center justify-center"
            >
              <img class="bff" src="/img/companies/bbf.svg" alt="Bundesministerium für Bildung und Forschung"/>
            </div>
            <div
              target="_blank"
              class="logos-row-icon flex align-center justify-center"
            >
              <img class="cornelsen" src="/img/companies/cornelsen.svg" alt="Cornelsen - potenziale entfalten"/>
            </div>
            <div
              target="_blank"
              class="logos-row-icon flex align-center justify-center"
            >
              <img class="mb" src="/img/companies/mb.svg" alt="Mein Bildungsraum"/>
            </div>
          </div>
          <!--
          <-- PC --
          <div class="logos-row d-none d-md-flex">
            <div
              v-for="(company, index) in smallCompanies" :key="index"
              class="logos-row-icon small flex align-center justify-center"
              target="_blank"
            >
              <img
                :src="company.src"
                :alt="company.alt"
              />
            </div>
          </div>
          <-- MOBILE --
          <swiper-container
            class="d-md-none m-sm-block mt-4"
            slides-per-view="auto"
            space-between="48"
            grab-cursor
            :keyboard="{
              enabled: true,
              onlyInViewport: true
            }"
          >
            <swiper-slide
              class="swiper-tile flex"
              v-for="(company, index) in smallCompanies" :key="index"
              tabindex="0"
            >
              <a
                class="flex align-center justify-center w-100"
                :href="company.href"
                target="_blank"
              >
                <img
                  class="small"
                  :src="company.src"
                  :alt="company.alt"
                />
              </a>
            </swiper-slide>
          </swiper-container>
          -->
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import './../../styles/_fonts.scss';
.footer {
  background-color: $color-grey-7;

  &-container {
    justify-content: space-between;
    align-items: flex-start;
    padding: 80px 48px;
    gap: 94px;
    min-height: 100px;
  }

  ul.links {
    margin-top: 48px;
    margin-bottom: 48px;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    list-style-type: none;
    padding: 0;
    overflow: hidden;

    li {
      @extend .font-type-md-b4;
      @extend .font-sm-button;
    }
  }

  .icons {
    display: flex;
    gap: 34px;
    margin-bottom: 16px;
  }

  .separator {
    align-self: center;
    height: 295px;
    border-right: 1.5px solid $color-primary-10;
  }

  .partners {
    flex: 4;
  }

  .logos {
    &-row {
      display: flex;
      flex-wrap: wrap;
      margin-top: 64px;
      gap: 48px;

      &-icon {
        height: 100px;
        flex: 1;
        text-align: center;
        border: 1px solid $color-primary-20;

        &.small {
          width: 69px;

          img {
            height: 54px;
          }
        }
        img {
          &.bff {
            width: 124px;
          }
          &.cornelsen {
            width: 108px;
          }
          &.mb {
            width: 190px;
          }
        }
      }
    }
  }
  @media (max-width: $MAX-WIDTH-MOBILE) {
    &-container {
      justify-content: space-between;
      align-items: flex-start;
      padding: 32px 16px;
      gap: 94px;
    }
    ul.links {
      margin-top: 24px;
      margin-bottom: 24px;
    }

    .logos {
      &-row {
        margin-top: 24px;
        &-icon {
          height: 80px;

          img {
            &.bff {
              width: 80px;
            }
            &.cornelsen {
              width: 71px;
            }
            &.mb {
              width: 87px;
              height: 13px;
            }
          }
        }
      }
      .swiper-tile {
        overflow: hidden;
        width: 72px;
        height: 62px;
        border: 1px solid $color-primary-20;

        .small {
          width: 41px;
        }
      }
    }
  }
}
</style>
