<template>
  <router-view />

</template>


<script>
import { computed } from "vue";
import { useStore } from "vuex";

export default {
  setup() {
    const store = useStore();

    const isAuthenticated = computed(() => store.getters["auth/isAuthenticated"]);
    const user = computed(() => store.getters["auth/getUser"]);

    const logout = () => store.dispatch("auth/logout");

    return { isAuthenticated, user, logout };
  },
};
</script>
