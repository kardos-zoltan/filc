
import { z } from "zod"

// Define the schema for the route parameters 
const paramsSchema = z.object({
    course_id: z.coerce.number().int(),
    post_id: z.coerce.number().int()
})

export default defineEventHandler(async (event) => {
    // Parse params, return if error
    const params = await getValidatedRouterParams(event, paramsSchema.safeParse);
    if (params.error != null) throw createError({
        status: 400 
    });

    // If not logged in, return 401
    if (event.context.auth.user == null) throw createError({
        status: 401
    });

    // If user isn't in course, return 403
    if (
        !await event.context.auth.isAuthed`
            SELECT 1 
            FROM user_courses 
            WHERE user_id = ${event.context.auth.user?.id} 
            AND course_id = ${params.data.course_id} 
            LIMIT 1
        `
    ) {
        throw createError({
            status: 403 
        });
    }

    const db = useDatabase();

    // SELECT comment data
    const commentsResult = await db.sql`
        SELECT
            comments.id,
            post_id,
            users.name as author,
            content
        FROM
            comments
        INNER JOIN
            users
        ON
            users.id = user_id
        WHERE
            post_id = ${params.data.post_id}
    `;

    // Error handling
    if (commentsResult.rows == null || commentsResult.error) {
        throw createError({
            status: 500,
            statusText: (import.meta.dev ? commentsResult.error : "SQL Error")
        });
    } 

    return commentsResult.rows as Comment2[];
})