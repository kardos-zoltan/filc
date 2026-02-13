export default defineEventHandler(async (event) => {
    // Unauthenticate the user
    event.context.auth.unauthenticate();
});