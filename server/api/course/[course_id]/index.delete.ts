import { z } from "zod";

// Define the schema for the route parameters
const paramsSchema = z.object({
    course_id: z.int()
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
        SELECT teacher_id
        FROM courses
        WHERE id = ${params.data.course_id}
    `;

    // If the logged in user is not the teacher, return 403
    if (teacherId.rows?.at(0)?.id !== event.context.auth.user.id) throw createError({
        status: 403, 
    });

    // Delete the course
    await db.sql`DELETE FROM courses WHERE id = ${params.data.course_id}`;
});