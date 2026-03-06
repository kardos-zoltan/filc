import { z } from "zod";

// Define the schema for the request body
const bodySchema = z.object({
    join_code: z.string().max(8)
})

export default defineEventHandler(async (event) => {
    // Parse params, return if error
    const body = await readValidatedBody(event, bodySchema.safeParse);
    if (body.error != null) throw createError({
        status: 400
    });

    // If not logged in, return 401
    if (event.context.auth.user == null) throw createError({
        status: 401
    });

    const db = useDatabase();

    // Check if course has join code
    const codeResult = await db.sql`
        SELECT course_id
        FROM join_codes
        WHERE code = ${body.data.join_code} 
        LIMIT 1
    `

    // Error handling
    if (codeResult.rows == null || codeResult.error) {
        throw createError({
            status: 500,
            statusText: (import.meta.dev ? codeResult.error : "SQL Error")
        });
    } 

    // If course doesn't have a join code, or join code is invalid, return 404
    if (codeResult.rows.length === 0) {
        throw createError({
            status: 404,
        });
    }

    // Join the course 
    await db.sql`
        INSERT INTO user_courses (user_id, course_id, role_id)
        VALUES (${event.context.auth.user.id}, ${codeResult.rows[0]!.course_id as number}, 1)
    `    

    return codeResult.rows[0]!.course_id as number;
});