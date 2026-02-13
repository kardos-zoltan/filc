import { z } from "zod";

// Define the schema for the request body
const bodySchema = z.object({
    name: z.string().max(255),
})

export default defineEventHandler(async (event) => {
    // If not logged in, redirect to home
    if (event.context.auth.user == null) return sendRedirect(event, "/");

    const db = useDatabase();

    const body = await readValidatedBody(event, bodySchema.safeParse);
    if (body.error != null) return sendError(event, body.error)

    // Create the course
    await db.sql`
        INSERT INTO courses (teacher_id, name)
        VALUES (${event.context.auth.user.id}, ${body.data.name}) 
    `;

    // Get the id of the created course
    const { rows } = await db.sql`SELECT last_insert_id() as id`;

    // Redirect to the course page
    return sendRedirect(event, `/courses/${rows![0].id}`);
});