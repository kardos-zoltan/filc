export const useUserStore = defineStore("user", {
    state: () => ({
        id: -1,
        name: ""
    }),

    actions: {
        async fetch() {
            try {
                const user = await $fetch("/api/auth/user");

                this.name = user.name;
                this.id = user.id;
            } catch (e) {
                console.log(e)
            }
        }
    }
})