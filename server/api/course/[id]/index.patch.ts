import { z } from "zod";

// Define the schema for the request body
const bodySchema = z.object({
    name: z.string().max(255).optional(),
    teacher_id: z.int().optional()
});

// Define the schema for the route parameters
const paramsSchema = z.object({
    id: z.int()
});

export default defineEventHandler(async (event) => {
    // If not logged in, redirect to home
    if (event.context.auth.user == null) return sendRedirect(event, "/");

    const db = useDatabase();

    const params = await getValidatedRouterParams(event, paramsSchema.parse);
    const body = await readValidatedBody(event, bodySchema.parse);

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

    // Update the course with given fields
    if (body.name) {
        await db.sql`UPDATE courses SET name = ${body.name} WHERE id = ${params.id}`;
    }
    if (body.teacher_id) {
        await db.sql`UPDATE courses SET teacher_id = ${body.teacher_id} WHERE id = ${params.id}`;
    }
})