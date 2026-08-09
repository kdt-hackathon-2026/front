<template>
  <svg viewBox="0 0 64 64" :width="size" :height="size" class="mascot" :class="{ 'is-talking': talking }" aria-hidden="true">
    <ellipse cx="32" cy="56" rx="16" ry="4" fill="rgba(20,30,60,0.10)" />
    <circle cx="32" cy="30" r="22" fill="var(--color-primary, #22468c)" />
    <circle cx="32" cy="30" r="22" fill="url(#mascot-shine)" opacity="0.35" />
    <circle cx="23" cy="27" r="5.6" fill="#fff" />
    <circle cx="41" cy="27" r="5.6" fill="#fff" />
    <circle class="mascot-eye" cx="24" cy="28" r="2.6" fill="#1b1f27" />
    <circle class="mascot-eye" cx="42" cy="28" r="2.6" fill="#1b1f27" />
    <path class="mascot-mouth" d="M24 38q8 8 16 0" fill="none" stroke="#1b1f27" stroke-width="2.4" stroke-linecap="round" />
    <circle cx="14" cy="34" r="4" fill="#ffd166" />
    <circle cx="50" cy="34" r="4" fill="#ffd166" />
    <defs>
      <radialGradient id="mascot-shine" cx="35%" cy="25%" r="60%">
        <stop offset="0%" stop-color="#fff" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#fff" stop-opacity="0" />
      </radialGradient>
    </defs>
  </svg>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: number | string
    talking?: boolean
  }>(),
  {
    size: 48,
    talking: false
  }
)
</script>

<style scoped>
.mascot {
  display: block;
}
.is-talking .mascot-mouth {
  animation: mascot-talk 0.5s ease-in-out infinite;
}
@keyframes mascot-talk {
  0%, 100% { d: path('M24 38q8 8 16 0'); }
  50% { d: path('M24 39q8 3 16 0'); }
}
</style>
