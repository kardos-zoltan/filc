import { z } from "zod"
import * as crypto from "node:crypto";

const paramsSchema = z.object({
    course_id: z.int()
})

export default defineEventHandler(async (event): Promise<string> => {
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
        AND user_role = 2
    `;

    // If the logged in user is not the teacher, return 403
    if (teacherId.rows?.at(0)?.id !== event.context.auth.user.id) throw createError({
        status: 403, 
    });
    
    const joinCodeResult = await db.sql`
        SELECT code
        FROM join_codes
        WHERE course_id = ${params.data.course_id} 
        LIMIT 1
    `;

    // Error handling
    if (joinCodeResult.rows == null || joinCodeResult.error) {
        throw createError({
            status: 500,
            statusText: (import.meta.dev ? joinCodeResult.error : "SQL Error")
        });
    } 

    if (joinCodeResult.rows.length > 0) {
        return joinCodeResult.rows[0]!.code as string;
    }

    // 6 bytes is 8 base64 characters
    let bytes = crypto.randomBytes(6);
    let code = bytes.toString("base64");

    let isCodeUsed = await db.sql`
        SELECT 1
        FROM join_codes
        WHERE code = ${code}
        LIMIT 1
    `
    
    while (isCodeUsed.rows != null && isCodeUsed.rows.length != 0) {
        // 6 bytes is 8 base64 characters
        bytes = crypto.randomBytes(6);
        code = bytes.toString("base64");

        isCodeUsed = await db.sql`
            SELECT 1
            FROM join_codes
            WHERE code = ${code}
            LIMIT 1
        `
    };

    await db.sql`
        INSERT INTO join_codes (course_id, code, expires_at)
        VALUES (${params.data.course_id}, ${code})
    `;

    return code;
});