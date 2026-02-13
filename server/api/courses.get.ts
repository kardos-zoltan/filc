export default defineEventHandler(async (event): Promise<void | Course[]> => {
    // If not logged in, redirect to home
    if (event.context.auth.user == null) return sendRedirect(event, "/");

    const db = useDatabase();

    // Get all courses the user is in, along with the average grade and teacher info
    const coursesResult = await db.sql`
        SELECT
            courses.id
            courses.name,
            averages.average,
            users.id as teacherId
            users.name as teacherName,
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
            user_courses.user_id = ${event.context.auth.user.id}
    `;

    // Error handling
    if (coursesResult.rows == null || coursesResult.error) return sendError(event, new Error(import.meta.dev ? coursesResult.error : "SQL Error"));

    return coursesResult.rows as Course[];
})