import { z } from "zod";

// Define the schema for the request body
const bodySchema = z.object({
    course_id: z.int(),
    content: z.string().max(2000),
});

export default defineEventHandler(async (event) => {
    // Parse body, return if error
    const body = await readValidatedBody(event, bodySchema.safeParse);
    if (body.error != null) throw createError({
        status: 400 
    });

    // If not logged in, retorn 401
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

    // Create the post
    const insertResult = await db.sql`
        INSERT INTO posts (type_id, course_id, content)
        VALUES (1, ${body.data.course_id}, ${body.data.content})
    `;

    // Error handling
    if (insertResult.rows == null || insertResult.error) {
        throw createError({
            status: 500,
            statusText: (import.meta.dev ? insertResult.error : "SQL Error")
        });
    } 
})