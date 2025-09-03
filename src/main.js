import { createApp } from "vue";
import App from "./App.vue";
import "mdb-vue-ui-kit/css/mdb.min.css";
import store from "./store";
import router from "./router";

import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';


ModuleRegistry.registerModules([AllCommunityModule]);



const app = createApp(App);
app.use(store);
app.use(router);
app.mount("#app");
