import { z } from "zod"

const paramsSchema = z.object({
    course_id: z.coerce.number()
})

export default defineEventHandler(async (event): Promise<Student[]> => {
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
    
    const studentsResult = await db.sql`
       SELECT
            user_courses.user_id,
            users.name,
            COALESCE(
                SUM(student_grades.grade * grades.weight) / NULLIF(SUM(grades.weight), 0),
                0
            ) AS average
        FROM
            user_courses
        INNER JOIN
            users
            ON user_courses.user_id = users.id
        LEFT JOIN
            student_grades
            ON student_grades.student_id = user_courses.user_id
        LEFT JOIN
            grades
            ON student_grades.grade_id = grades.id
            AND grades.course_id = user_courses.course_id
        WHERE
            user_courses.course_id = ${params.data.course_id}
        AND
            user_courses.role_id = 1
        GROUP BY
            users.name
   `;

    // Error handling
    if (studentsResult.error) {
        throw createError({
            status: 500,
            statusText: (import.meta.dev ? studentsResult.error : "SQL Error")
        });
    } 

    return studentsResult.rows as Student[];
});