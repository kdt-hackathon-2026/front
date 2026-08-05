import { createPinia } from 'pinia';
import { createApp } from 'vue';

import App from '@/App.vue';
import '@/assets/styles/main.css';
import router from '@/router';
import { useAppStore } from '@/stores/app';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

useAppStore(pinia).initialize();

app.mount('#app');
