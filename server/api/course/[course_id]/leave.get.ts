import { z } from "zod";

// Define the schema for the route parameters
const paramsSchema = z.object({
    course_id: z.coerce.number().int()
});

export default defineEventHandler(async (event) => {
    // Parse params, if error return 400
    const params = await getValidatedRouterParams(event, paramsSchema.safeParse);
    if (params.error != null) throw createError({
        status: 400 
    });

    // If not logged in, return 401
    if (event.context.auth.user == null) throw createError({
        status: 401
    });

    const db = useDatabase();

    // Check if user in course 
    const userCourse = await db.sql`
        SELECT 1
        FROM user_courses
        WHERE course_id = ${params.data.course_id}
        AND user_id = ${event.context.auth.user.id}
    `;

    // If not, 403
    if (userCourse.rows?.length === 0) throw createError({
        status: 403
    })

    //Otherwise, remove user from course
    await db.sql`
        DELETE FROM user_courses
        WHERE course_id = ${params.data.course_id}
        AND user_id = ${event.context.auth.user.id}
    `
})