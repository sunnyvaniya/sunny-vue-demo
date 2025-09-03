import axiosInstance from "@/axios";  // Assuming this is where you define axiosInstance

export default {
    namespaced: true,

    state: () => ({
        stocks: [],
        stores: [], // your canonical list of stocks
    }),

    getters: {
        allStocks: (state) => state.stocks,
    },

    mutations: {
        SET_STOCKS(state, stocks) {
            state.stocks = Array.isArray(stocks) ? stocks : [];
        },
        SET_STORES(state, stores) {
            state.stores = Array.isArray(stores) ? stores : [];
        },

        ADD_NEW_STOCKS(state, newStocks) {
            state.stocks.push(...newStocks);  // Append the new stocks to the current list
        },

        REMOVE_STOCK(state, id) {
            state.stocks = state.stocks.filter((s) => String(s.id) !== String(id));
        },
    },

    actions: {
        async fetchStocks({ commit, rootState }, searchQuery) {
            try {


                const token = rootState.auth.token;

                const res = await axiosInstance.get("/stocks", {
                    headers: {
                        Authorization: `Bearer ${token}`, // Add token to headers
                    },
                    params: searchQuery ? { search: searchQuery } : {},
                });
                console.log(res.data.stocks);
                commit("SET_STOCKS", res.data?.stocks ?? []);
                return res.data?.stocks ?? [];
            } catch (err) {
                console.error("Failed to fetch stocks", err);
            }
        },

        async fetchStores({ commit, rootState }) {
            try {


                const token = rootState.auth.token;

                const res = await axiosInstance.get("/stores", {
                    headers: {
                        Authorization: `Bearer ${token}`, // Add token to headers
                    },
                });
                console.log(res.data.stores);
                commit("SET_STORES", res.data?.stores ?? []);
                return res.data?.stores ?? [];
            } catch (err) {
                console.error("Failed to fetch stocks", err);
            }
        },

        async deleteStock({ commit, rootState }, id) {
            try {
                const token = rootState.auth.token;


                await axiosInstance.delete(`/stocks/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                commit("REMOVE_STOCK", id);
            } catch (err) {
                console.error("Failed to delete stock", err);
            }
        },

        // Save new stocks and add them to the Vuex store
        async saveBulkStocks({ commit, rootState }, rows) {
            try {
                const token = rootState.auth.token;


                // Call the API to save the new records
                const res = await axiosInstance.post("/stocks/bulk", { rows }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                // Once saved, commit them to the Vuex store
                commit("ADD_NEW_STOCKS", res.data?.data ?? rows); // Add the new rows to the stocks array

                return res.data?.data ?? rows;
            } catch (error) {
                console.error(error);
                throw new Error("Failed to save the bulk stocks");
            }
        },
    },
};
