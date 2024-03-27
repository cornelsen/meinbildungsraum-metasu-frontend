<script setup>
import {  reactive } from 'vue'
import { getAuthorizationData } from '@/stores/authorization'
import InputText from '@/components/Forms/InputText.vue'

const {  firstName, lastName, email } = getAuthorizationData()
const formData = reactive({
  firstName: firstName,
  lastName: lastName,
  email: email
})
</script>

<template>
    <div class="limited-width mb-md-16 mb-8 w-100">
      <div class="settings color-black flex flex-column flex-md-row">
        <div class="settings-tile">
          <div class="header-md-7 header-sm-2">{{ $t('profile.settings.personalInfo') }}</div>
          <input-text
            class="mt-md-9 mt-8"
            :label="$t('profile.settings.firstName')"
            v-model="formData.firstName"
            persistent-placeholder
          />
          <input-text
            class="mt-md-9 mt-8"
            :label="$t('profile.settings.lastName')"
            v-model="formData.lastName"
            persistent-placeholder
          />
          <input-text
            class="mt-md-9 mt-8"
            :label="$t('profile.settings.email')"
            v-model="formData.email"
            persistent-placeholder
          />
        </div>
        <div class="settings-tile">

        </div>
      </div>
  </div>
</template>
<style lang="scss">
.settings {
  gap: 48px;

  &-tile {
    padding: 48px;
    flex: 1;
    background-color: $color-grey-8;
  }
}

@media (max-width: $MAX-WIDTH-MOBILE) {
  .settings {
    gap: 32px;

    &-tile {
      padding: 32px 16px;
    }
  }
}
</style>