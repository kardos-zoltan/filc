import { z } from "zod"

// Define the schema for the request body
const paramsSchema = z.object({
    course_id: z.coerce.number().int(),
    post_id: z.coerce.number().int(),
    comment_id: z.coerce.number().int(),
});

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

    const db = useDatabase();

    // Get the teacher id for the course
    const teacherId = await db.sql`
        SELECT user_id
        FROM user_courses
        WHERE course_id = ${params.data.course_id}
        AND role_id = 2
    `;

    const isPoster = await event.context.auth.isAuthed`
                        SELECT 1 
                        FROM posts 
                        WHERE id = ${params.data.post_id} 
                        AND user_id = ${event.context.auth.user?.id}
                        LIMIT 1
                    `
    const isTeacher = teacherId.rows?.at(0)?.user_id == event.context.auth.user.id ? true : false;

    // If user isn't poster or teacher, return 403
    if (!isPoster && !isTeacher) {
        throw createError({
            status: 403
        });
    }
    

    // Delete post 
    const deleteResult = await db.sql`
        DELETE FROM comments
        WHERE id = ${params.data.comment_id}
        LIMIT 1
    `;

    // Error handling
    if (deleteResult.error) {
        throw createError({
            status: 500,
            statusText: (import.meta.dev ? deleteResult.error : "SQL Error")
        });
    } 
})