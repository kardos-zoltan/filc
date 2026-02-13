export default defineNuxtRouteMiddleware(async (to, from) => {
    if (import.meta.server) return;
    
    const user = useUserStore();
    await callOnce(user.fetch);

    if (user.id !== -1) {
        return navigateTo("/courses");
    }
});