import { z } from "zod";

// Define the schema for the request body
const bodySchema = z.object({
    email: z.email().max(255),
    password: z.string().max(20),
})

export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, bodySchema.parse);

    // Authenticate the user
    const authStatus = await event.context.auth.authenticate(body.email, body.password);
    if (typeof authStatus === "string") {
        setResponseStatus(event, 403, "Forbidden");
    
        return authStatus;
    }

    const id = authStatus;

    const sessionToken = await event.context.auth.createSession(id);
    event.context.auth.storeSessionInCookies(sessionToken);
});