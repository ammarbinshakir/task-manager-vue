import { createApp } from "vue";
import App from "./App.vue";
import { useStore } from "./store";
import Home from "./views/Home.vue";
import { createRouter, createWebHistory } from "vue-router";

const routes = [{ path: "/", component: Home }];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);
// const store = useStore(); // Not needed here
app.use(router);
app.mount("#app");
