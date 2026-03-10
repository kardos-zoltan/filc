import { z } from "zod";

// Define the schema for the route parameters
const paramsSchema = z.object({
    course_id: z.coerce.number().int()
});

export default defineEventHandler(async (event): Promise<null | Course> => {
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

    // Select the course with given id, along with the average grade, teacher info, and student count
    const coursesResult = await db.sql`
        SELECT
            courses.id,
            courses.name,
            COALESCE(averages.average, 0) AS average,
            teachers.id AS teacherId,
            teachers.name AS teacherName,
            role_id AS role
            (
                SELECT COUNT(*)
                FROM user_courses
                WHERE user_courses.course_id = courses.id
                AND user_courses.role_id = 1
            ) AS student_count
        FROM
            courses
        LEFT JOIN (
            SELECT
                grades.course_id,
                SUM(student_grades.grade * grades.weight) / SUM(grades.weight) AS average
            FROM
                student_grades
            INNER JOIN
                grades ON student_grades.grade_id = grades.id
            WHERE
                student_grades.student_id = ${event.context.auth.user.id}
            GROUP BY
                grades.course_id
        ) AS averages
        ON
            courses.id = averages.course_id
        INNER JOIN
            user_courses AS teacher_uc
        ON
            teacher_uc.course_id = courses.id
        AND 
            teacher_uc.role_id = 2
        INNER JOIN
            users AS teachers
        ON
            teachers.id = teacher_uc.user_id
        WHERE
            courses.id = ${params.data.course_id}
        LIMIT 1
    `;

    // Error handling
    if (coursesResult.rows == null || coursesResult.error) {
        throw createError({
            status: 500,
            statusText: (import.meta.dev ? coursesResult.error : "SQL Error")
        });
    } 

    if (coursesResult.rows.length == 0) return null;

    return coursesResult.rows[0] as Course;
});