<script setup>
import { ref, onBeforeMount } from 'vue'
import { service } from '@/helpers/api'
import { useI18n } from 'vue-i18n'
import { useCookies } from 'vue3-cookies'
import InputText from '@/components/Forms/InputText.vue'
import Button from '@/components/Button/Button.vue'
import Loader from '@/components/Loader/Loader.vue'
import { useRouter } from 'vue-router'


const username = ref('')
const password = ref('')
const fetching = ref(false)
const error = ref(false)
const router = useRouter()
const { locale } = useI18n()
const { cookies } = useCookies()

onBeforeMount(() => {
  const lang = cookies.get('lang')
  if (lang === 'de') locale.value = 'de'
  else if (lang === 'en') locale.value = 'en'
  else {
    locale.value = 'de'
    cookies.set('lang', locale.value)
  }
})
const login = async () => {
  fetching.value = true
  error.value = false
  try {
    const fd = new FormData()
    fd.append('username', username.value)
    fd.append('password', password.value)
    await service.post('/admin/login', fd)
    router.push('/')
  } catch (e) {
    error.value = true
    console.log(e)
  }
  fetching.value = false
}

</script>
<template>
  <div class="color-black login flex justify-center align-center">
    <v-form
      class="login-container"
      :class="{ 'mt-2': !fetching }"
      @submit.prevent="()=>{}"
    >
      <Loader v-if="fetching"/>
      <div class="login-container-form">
        <div class="form-input">
          <input-text
            :disabled="fetching"
            class="uppercase"
            :label="$t('admin.login.username')"
            v-model="username"
          />
        </div>
        <div class="form-input mt-5">
          <input-text
            :disabled="fetching"
            class="uppercase"
            :label="$t('admin.login.password')"
            type="password"
            autocomplete="on"
            v-model="password"
          />
          </div>
          <div v-if="error" class="error font-type-b6">
            {{  $t('admin.login.error') }}
          </div>
          <Button
            @click="login"
            :disabled="fetching"
            type="submit"
            :text="$t('admin.login.loginButton')"
            class="mt-5"
            variant="black"
          />
        </div>
    </v-form>
  </div>
</template>

<style lang="scss">
  .login {
    background-color: $color-grey-6;
    width: 100vw;
    height: 100vh;

    &-container {
      background-color: #FFF;

      &-form {
        padding: 64px;

        .error {
          padding: 24px 0 12px 0;
          color: $color-error;
        }
      }
    }

    @media (max-width: $MAX-WIDTH-MOBILE) {
      &-container {
        width: 100%;
        height: 100%;
      }
    }
  }
</style>