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
            courses.id
            courses.name,
            averages.average,
            users.id as teacherId
            users.name as teacherName,
            (
                SELECT COUNT(*)
                FROM user_courses
                WHERE user_courses.course_id = courses.id
            ) as student_count
        FROM
            user_courses
        INNER JOIN
            courses
        ON
            courses.id = user_courses.course_id
        LEFT JOIN (
            SELECT
                grades.course_id, 
                sum(student_grades.grade * grades.weight) / sum(grades.weight) as average
            FROM
                student_grades
            INNER JOIN
                grades
            ON
                student_grades.grade_id = grades.id
            WHERE
                student_id = ${event.context.auth.user.id}
        ) AS averages 
        ON
            courses.id = averages.course_id
        INNER JOIN
            users
        ON
            courses.teacher_id = users.id
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