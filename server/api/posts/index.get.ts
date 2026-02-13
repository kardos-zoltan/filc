import { z } from "zod"

// Define the schema for the request body
const bodySchema = z.object({
    course_id: z.int()
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

    // If user isn't in course, return 403
    if (
        !await event.context.auth.isAuthed`
            SELECT 1 
            FROM user_courses 
            WHERE user_id = ${event.context.auth.user?.id} 
            AND course_id = ${body.data.course_id} 
            LIMIT 1
        `
    ) {
        throw createError({
            status: 403 
        });
    }

    const db = useDatabase();

    // SELECT post data
    const postsResult = await db.sql`
        SELECT
            posts.id,
            posts.content
            post_types.name as type
        FROM
            posts
        INNER JOIN
            post_types
        ON
            posts.type_id = post_types.id
        WHERE
            course_id = ${body.data.course_id}
    `;

    // Error handling
    if (postsResult.rows == null || postsResult.error) {
        throw createError({
            status: 500,
            statusText: (import.meta.dev ? postsResult.error : "SQL Error")
        });
    } 

    return postsResult.rows as Post[];
})