import { z } from "zod"

// Define the schema for the request body
const bodySchema = z.object({
    post_id: z.int(),
})

export default defineEventHandler(async (event) => {
    // Parse body, return if error
    const body = await readValidatedBody(event, bodySchema.safeParse);
    if (body.error != null) throw createError({
        status: 400 
    });

    // If not logged in, return 401
    if (event.context.auth.user == null) throw createError({
        status: 401
    });

    // If user isn't poster, return 403
    if (
        !await event.context.auth.isAuthed`
            SELECT 1 
            FROM posts 
            WHERE id = ${body.data.post_id} 
            AND user_id = ${event.context.auth.user?.id} 
            LIMIT 1
        `
    ) {
        throw createError({
            status: 403
        });
    }

    const db = useDatabase();

    // Delete post 
    const deleteResult = await db.sql`
        DELETE FROM posts
        WHERE id = ${body.data.post_id}
        LIMIT 1
    `;

    // Error handling
    if (deleteResult.rows == null || deleteResult.error) {
        throw createError({
            status: 500,
            statusText: (import.meta.dev ? deleteResult.error : "SQL Error")
        });
    } 
})