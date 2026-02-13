import { z } from 'zod';

// Define the schema for the request body
const bodySchema = z.object({
    name: z.string().max(255),
    email: z.email().max(255),
    password: z.string().min(6).max(20),
});

export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, bodySchema.parse);

    // Hash the password
    const hashedPassword = event.context.auth.hashPassword(body.password);

    // Register the user
    const res = await event.context.auth.register(body.name, body.email, hashedPassword);

    if (res != undefined) {
        throw createError({
            status: 400,
            statusText: res
        });
    }
});
