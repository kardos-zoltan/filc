import { z } from "zod";

// Define the schema for the request body
const bodySchema = z.object({
    content: z.string().max(2000)
});

// Define the schema for route parameters
const paramsSchema = z.object({
    comment_id: z.coerce.number().int(),
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

    // If user isn't commenter, return 403
    if (
        !await event.context.auth.isAuthed`
            SELECT 1 
            FROM comments 
            WHERE id = ${params.data.comment_id} 
            AND user_id = ${event.context.auth.user?.id} 
            LIMIT 1
        `
    ) {
        throw createError({
            status: 403
        });
    }

    const db = useDatabase();

    // Update the comment
    const updateResult = await db.sql`
        UPDATE comments
        SET content = ${body.data.content}
        WHERE comment_id = ${params.data.comment_id}
    `;

    // Error handling
    if (updateResult.rows == null || updateResult.error) {
        throw createError({
            status: 500,
            statusText: (import.meta.dev ? updateResult.error : "SQL Error")
        });
    };
})