import { createApp } from "vue";
import { IonicVue } from "@ionic/vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";

/* Ionic core CSS */
import "@ionic/vue/css/core.css";
import "@ionic/vue/css/normalize.css";
import "@ionic/vue/css/structure.css";
import "@ionic/vue/css/typography.css";
import "@ionic/vue/css/padding.css";
import "@ionic/vue/css/flex-utils.css";
import "@ionic/vue/css/display.css";

/* KodLyft theme (Ionic vars) + tokens + Tailwind utilities */
import "./theme/variables.css";
import "./style.css";

const app = createApp(App).use(IonicVue).use(createPinia()).use(router);

router.isReady().then(() => app.mount("#app"));
