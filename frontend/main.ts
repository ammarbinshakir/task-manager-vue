import { createApp } from "vue";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import Aura from "@primeuix/themes/aura";
import App from "./App.vue";
import Home from "./views/Home.vue";
import { createRouter, createWebHistory } from "vue-router";

// PrimeVue CSS
import "primeicons/primeicons.css";

const routes = [{ path: "/", component: Home }];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
});
app.use(ToastService);
app.mount("#app");
