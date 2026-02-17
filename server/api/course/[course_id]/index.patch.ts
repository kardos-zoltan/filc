import { z } from "zod";

// Define the schema for the request body
const bodySchema = z.object({
    name: z.string().max(255).optional(),
    teacher_id: z.int().optional()
});

// Define the schema for the route parameters
const paramsSchema = z.object({
    course_id: z.int()
});

export default defineEventHandler(async (event) => {
    // Parse body, if error return 400
    const body = await readValidatedBody(event, bodySchema.safeParse);
    if (body.error != null) throw createError({
        status: 400 
    });
    
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

    // Update the course with given fields
    if (body.data.name) {
        await db.sql`UPDATE courses SET name = ${body.data.name} WHERE id = ${params.data.course_id}`;
    }
    if (body.data.teacher_id) {
        await db.sql`UPDATE courses SET teacher_id = ${body.data.teacher_id} WHERE id = ${params.data.course_id}`;
    }
})