export default defineEventHandler(async (event) => {
    const user = event.context.auth.user;

    if (user == null) {
        throw createError({
            status: 401
        });
    }

    return user;
})