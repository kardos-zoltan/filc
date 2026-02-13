import { z } from "zod";

// Define the schema for the route parameters
const paramsSchema = z.object({
    id: z.int()
});

export default defineEventHandler(async (event) => {
    // If not logged in, redirect to home
    if (event.context.auth.user == null) return sendRedirect(event, "/");

    const db = useDatabase();

    const params = await getValidatedRouterParams(event, paramsSchema.parse);

    // Get the teacher id for the course
    const teacherId = await db.sql`
        SELECT teacher_id
        FROM courses
        WHERE id = ${params.id}
    `;

    // If the logged in user is not the teacher, return 401
    if (teacherId.rows?.at(0)?.id !== event.context.auth.user.id) {
        setResponseStatus(event, 401, "Unauthorized")
        return sendError(event, new Error("Unauthorized"));
    }

    // Delete the course
    await db.sql`DELETE FROM courses WHERE id = ${params.id}`;
});