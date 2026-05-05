import { z } from "zod"

const paramsSchema = z.object({
    course_id: z.coerce.number(),
    student_id: z.coerce.number()
})

const bodySchema = z.object({
    grade_id: z.number(),
})

export default defineEventHandler(async (event)=> {
    // Parse params, return if error
    const params = await getValidatedRouterParams(event, paramsSchema.safeParse);
    if (params.error != null) throw createError({
        status: 400 
    });
    
    // Parse body, if error return 400
    const body = await readValidatedBody(event, bodySchema.safeParse);
    if (body.error != null) throw createError({
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

    // If the logged in user is not the teacher, return 403
    if (teacherId.rows?.at(0)?.user_id !== event.context.auth.user.id) throw createError({
        status: 403, 
    });
    
    // Delete the grade
    await db.sql`
        DELETE FROM 
            student_grades 
        WHERE 
            student_id = ${params.data.student_id} 
        AND 
            grade_id = ${body.data.grade_id}
    `;
});