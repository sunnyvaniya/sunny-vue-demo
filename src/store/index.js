// src/store/index.js
import { createStore } from "vuex";
import auth from "./modules/auth";
import stocks from "./modules/stocks";

const store = createStore({
    modules: {
        auth,
        stocks,
    },
});

export default store;
