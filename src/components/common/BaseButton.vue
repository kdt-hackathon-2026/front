<script setup lang="ts">
import { computed } from 'vue';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface Props {
  type?: 'button' | 'submit' | 'reset';
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  disabled: false,
  loading: false,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:opacity-90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-muted',
  danger: 'bg-danger text-danger-foreground hover:opacity-90',
};

const buttonClasses = computed(() => variantClasses[props.variant]);

const handleClick = (event: MouseEvent): void => {
  if (props.disabled || props.loading) {
    return;
  }

  emit('click', event);
};
</script>

<template>
  <button
    :type="props.type"
    :disabled="props.disabled || props.loading"
    :aria-busy="props.loading"
    class="inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
    :class="buttonClasses"
    @click="handleClick"
  >
    <slot />
  </button>
</template>
