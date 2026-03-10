export default defineEventHandler(async (event): Promise<Course[]> => {
    // If not logged in, return 401
    if (event.context.auth.user == null) throw createError({
        status: 401
    });

    const db = useDatabase();

    // Get all courses the user is in, along with the average grade and teacher info
    const coursesResult = await db.sql`
        SELECT
            courses.id,
            courses.name,
            COALESCE(averages.average, 0) AS average,
            teacher_uc.user_id AS teacherId,
            teachers.name AS teacherName,
            user_roles.name AS role
        FROM
            user_courses AS student_uc

        INNER JOIN
            courses 
        ON 
            courses.id = student_uc.course_id

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

        LEFT JOIN
            user_courses AS teacher_uc
        ON
            teacher_uc.course_id = courses.id
        AND 
            teacher_uc.role_id = 2

        LEFT JOIN
            users AS teachers
        ON
            teachers.id = teacher_uc.user_id

        INNER JOIN
            user_roles
        ON
            student_uc.role_id = user_roles.id

        WHERE
            student_uc.user_id = ${event.context.auth.user.id}
        `;

    // Error handling
    if (coursesResult.rows == null || coursesResult.error) {
        throw createError({
            status: 500,
            statusText: (import.meta.dev ? coursesResult.error : "SQL Error")
        });
    } 

    return coursesResult.rows as Course[];
})