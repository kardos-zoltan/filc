import { z } from "zod";

const paramsSchema = z.object({
    id: z.int()
});

export default defineEventHandler(async (event) => {
    if (event.context.auth.user == null) return sendRedirect(event, "/");

    const db = useDatabase();

    const params = await getValidatedRouterParams(event, paramsSchema.parse);

    const teacherId = await db.sql`
        SELECT teacher_id
        FROM courses
        WHERE id = ${params.id}
    `;

    if (teacherId.rows?.at(0)?.id !== event.context.auth.user.id) {
        setResponseStatus(event, 401, "Unauthorized")
        return sendError(event, new Error("Unauthorized"));
    }

    await db.sql`DELETE FROM courses WHERE id = ${params.id}`;
});