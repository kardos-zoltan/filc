import { z } from "zod";

// Define the schema for the request body
const bodySchema = z.object({
    title: z.string().min(1).max(200),
    date: z.coerce.date().optional(),
    questions: z.array(
        z.discriminatedUnion("type", [
            z.object({
                type: z.literal("singularChoice"),
                points: z.int(),
                question: z.string().max(200),
                choices: z.array(z.string().max(50)).max(10),
                correctChoice: z.int().nonnegative()
            }).refine(x => x.correctChoice < x.choices.length),
            z.object({
                type: z.literal("multipleChoice"),
                points: z.int(),
                question: z.string().max(200),
                choices: z.array(z.string().max(50)).max(10),
                correctChoices: z.array(z.int().nonnegative()).transform(x => [...new Set(x)])
            }).refine(x => x.correctChoices.every(y => y < x.choices.length)),
            z.object({
                type: z.literal("shortAnswer"),
                points: z.int(),
                question: z.string().max(200),
                correctChoice: z.string().max(50).optional()
            }),
            z.object({
                type: z.literal("longAnswer"),
                points: z.int(),
                question: z.string().max(200),
            })
        ])
    )
});

// Define the schema for the route parameters
const paramsSchema = z.object({
    course_id: z.coerce.number().int()
});

export default defineEventHandler(async (event) => {
    // Parse body, return if error
    const body = await readValidatedBody(event, bodySchema.safeParse);
    if (body.error != null) throw createError({
        status: 400,
        data: body.error
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
        VALUES (2, ${params.data.course_id}, ${event.context.auth.user.id}, ${JSON.stringify(body.data)})
    `;

    // Error handling
    if (insertResult.error) {
        throw createError({
            status: 500,
            statusText: (import.meta.dev ? insertResult.error : "SQL Error")
        });
    } 
    
})