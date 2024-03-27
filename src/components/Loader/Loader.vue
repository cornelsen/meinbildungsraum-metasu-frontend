<script setup>
</script>

<template>
  <div class="progress-bar" role="progressbar" aria-live="polite">
    <span class="sr-only">{{ $t('srOnly.fetchingResults') }}</span>
    <div class="progress-bar-indicator"></div>
  </div>
</template>

<style lang="scss" scoped>
  .progress-bar {
    @keyframes expand {
      0% {
        width: 0;
      }
      90%, 100% {
        width: 100%;
      }
    }
    width: 100%;

    &-indicator {
      margin-top : 1px;
      height: 8px;
      animation-delay: 1s;
      background-color: $color-success;
      animation: expand 3s linear infinite;
    }
  }
  </style>