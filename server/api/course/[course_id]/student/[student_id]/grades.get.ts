import { z } from "zod"

const paramsSchema = z.object({
    course_id: z.coerce.number(),
    student_id: z.coerce.number()
})

export default defineEventHandler(async (event): Promise<Grade[]> => {
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

    // If the logged in user is not the teacher, return 403
    if (teacherId.rows?.at(0)?.user_id !== event.context.auth.user.id) throw createError({
        status: 403, 
    });
    
    const gradeResult = await db.sql`
        SELECT 
            grades.id,
            student_grades.grade,
            grades.name,
            grades.weight,
            grades.date
        FROM
            student_grades
        INNER JOIN 
            grades
        ON
            student_grades.grade_id = grades.id
        WHERE
            grades.course_id = ${params.data.course_id}
        AND
            student_grades.student_id = ${params.data.student_id}
   `;

    // Error handling
    if (gradeResult.error) {
        throw createError({
            status: 500,
            statusText: (import.meta.dev ? gradeResult.error : "SQL Error")
        });
    } 

    return gradeResult.rows as Grade[];
});