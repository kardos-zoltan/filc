import { z } from "zod";

// Define the schema for the request body
const bodySchema = z.object({
    content: z.object()
});

// Define the schema for the route parameters
const paramsSchema = z.object({
    course_id: z.coerce.number().int()
});

export default defineEventHandler(async (event) => {
    // Parse body, return if error
    const body = await readValidatedBody(event, bodySchema.safeParse);
    if (body.error != null) throw createError({
        status: 400
    });

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
            WHERE user_id = ${event.context.auth.user?.id} 
            AND course_id = ${params.data.course_id} 
            LIMIT 1
        `
    ) {
        throw createError({
            status: 403 
        });
    }

    const db = useDatabase();

    // Create the post
    const insertResult = await db.sql`
        INSERT INTO posts (type_id, course_id, user_id, content)
        VALUES (2, ${params.data.course_id}, ${event.context.auth.user.id}, ${JSON.stringify(body.data.content)})
    `;

    // Error handling
    if (insertResult.rows == null || insertResult.error) {
        throw createError({
            status: 500,
            statusText: (import.meta.dev ? insertResult.error : "SQL Error")
        });
    } 
    
})