import { z } from "zod";

const bodySchema = z.object({
    name: z.string().max(255),
})

export default defineEventHandler(async (event) => {
    if (event.context.auth.user == null) return sendRedirect(event, "/");

    const db = useDatabase();

    const body = await readValidatedBody(event, bodySchema.safeParse);
    if (body.error != null) return sendError(event, body.error)

    await db.sql`
        INSERT INTO courses (teacher_id, name)
        VALUES (${event.context.auth.user.id}, ${body.data.name}) 
    `;

    const { rows } = await db.sql`SELECT last_insert_id() as id`;

    return sendRedirect(event, `/courses/${rows![0].id}`);
});