import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
  const isInitialized = ref(false);

  const initialize = (): void => {
    isInitialized.value = true;
  };

  return {
    isInitialized,
    initialize,
  };
});
