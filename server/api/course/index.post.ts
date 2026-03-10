import { z } from "zod";

// Define the schema for the request body
const bodySchema = z.object({
    name: z.string().max(255),
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

    // Create the course
    await db.sql`
        INSERT INTO courses (name)
        VALUES (${body.data.name})
    `;

    // Get the id of the created course
    const { rows } = await db.sql`SELECT last_insert_id() as id`;

    // Add teacher role to user_roles
    await db.sql`
        INSERT INTO user_courses (user_id, course_id, role_id)
        VALUES (${event.context.auth.user.id}, ${rows![0]!.id}, 2)
    `

    // Return the created course's id
    return rows![0]!.id;
});