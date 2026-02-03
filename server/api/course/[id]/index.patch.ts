import { z } from "zod";

const bodySchema = z.object({
    name: z.string().max(255).optional(),
    teacher_id: z.int().optional()
});

const paramsSchema = z.object({
    id: z.int()
});

export default defineEventHandler(async (event) => {
    if (event.context.auth.user == null) return sendRedirect(event, "/");

    const db = useDatabase();

    const params = await getValidatedRouterParams(event, paramsSchema.parse);
    const body = await readValidatedBody(event, bodySchema.parse);

    const teacherId = await db.sql`
        SELECT teacher_id
        FROM courses
        WHERE id = ${params.id}
    `;

    if (teacherId.rows?.at(0)?.id !== event.context.auth.user.id) {
        setResponseStatus(event, 401, "Unauthorized")
        return sendError(event, new Error("Unauthorized"));
    }

    if (body.name) {
        await db.sql`UPDATE courses SET name = ${body.name} WHERE id = ${params.id}`;
    }
    if (body.teacher_id) {
        await db.sql`UPDATE courses SET teacher_id = ${body.teacher_id} WHERE id = ${params.id}`;
    }
})