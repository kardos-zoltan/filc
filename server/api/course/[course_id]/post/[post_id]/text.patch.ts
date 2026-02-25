import { z } from "zod";

// Define the schema for the request body
const bodySchema = z.object({
    content: z.string().max(2000)
});

// Define the schema for route parameters
const paramsSchema = z.object({
    post_id: z.coerce.number().int(),
});

export default defineEventHandler(async (event) => {
    // Parse body, return if error
    const body = await readValidatedBody(event, bodySchema.safeParse);
    if (body.error != null) throw createError({
        status: 400 
    });

    // Parse params, return if error
    const params = await getValidatedRouterParams(event, paramsSchema.safeParse);
    if (params.error != null) throw createError({
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
            WHERE id = ${params.data.post_id} 
            AND user_id = ${event.context.auth.user?.id} 
            LIMIT 1
        `
    ) {
        throw createError({
            status: 403
        });
    }

    const db = useDatabase();

    // Update the post
    const updateResult = await db.sql`
        UPDATE posts
        SET content = ${body.data.content}
        WHERE post_id = ${params.data.post_id}
    `;

    // Error handling
    if (updateResult.rows == null || updateResult.error) {
        throw createError({
            status: 500,
            statusText: (import.meta.dev ? updateResult.error : "SQL Error")
        });
    };
})