import { z } from "zod"

// Define the schema for the route parameters 
const paramsSchema = z.object({
    course_id: z.coerce.number().int(),
    post_id: z.coerce.number().int(),
});

type Quiz = {
    title: string
    date: Date
    questions: Array<
        {
            type: "singularChoice"
            points: number
            question: string
            choices: string[]
            correctChoice: number
        } | {
            type: "multipleChoice"
            points: number
            question: string
            choices: string[]
            correctChoices: number[]
        } | {
            type: "shortAnswer"
            points: number
            question: string
            correctChoice: string
        } | {
            type: "longAnswer"
            points: number
            question: string
        }
    >
};

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

    // If user isn't in course, return 403
    if (
        !await event.context.auth.isAuthed`
            SELECT 1 
            FROM user_courses 
            WHERE user_id = ${event.context.auth.user.id} 
            AND course_id = ${params.data.course_id} 
            LIMIT 1
        `
    ) {
        throw createError({
            status: 403 
        });
    }

    const db = useDatabase();
    
    const userRole = await db.sql`
        SELECT
            role_id
        FROM
            user_courses
        WHERE
            course_id = ${params.data.course_id}
        AND
            user_id = ${event.context.auth.user.id}
    `;

    // Error handling
    if (userRole.rows == null || userRole.error) {
        throw createError({
            status: 500,
            statusText: (import.meta.dev ? userRole.error : "SQL Error")
        });
    }

    // SELECT post data
    const postsResult = await db.sql`
        SELECT
            posts.id,
            posts.content,
            post_types.name as type,
            users.name as author,
            posted_at,
            post_completed.completed_at as completed_at,
            posts.user_id as userId
        FROM
            posts
        INNER JOIN
            post_types
        ON
            posts.type_id = post_types.id
        INNER JOIN
            users
        ON
            posts.user_id = users.id
        LEFT JOIN
            post_completed
        ON
            posts.id = post_completed.post_id 
        AND ${event.context.auth.user.id} = post_completed.user_id
        WHERE
            course_id = ${params.data.course_id}
        AND
            posts.id = ${params.data.post_id}
    `;

    // Error handling
    if (postsResult.rows == null || postsResult.error) {
        throw createError({
            status: 500,
            statusText: (import.meta.dev ? postsResult.error : "SQL Error")
        });
    } 

    const quizPost = postsResult.rows[0] as Post;
    const quizContent = JSON.parse(quizPost.content) as Quiz;

    if (userRole.rows[0]!.role_id === 1) {
        const questions = 
            quizContent.questions
                .map(x => {
                    if (x.type === "singularChoice" || x.type === "multipleChoice") {
                        return { 
                            type: x.type,
                            points: x.points,
                            question: x.question,
                            choices: x.choices,
                        }
                    }

                    return {
                        type: x.type,
                        points: x.points,
                        question: x.question
                    }
                });
        
        return {
            ...quizPost,
            content: {
                ...quizContent,
                questions
            }
        }
    }

    return {
        ...quizPost,
        content: quizContent
    }
});