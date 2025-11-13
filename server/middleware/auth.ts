import * as crypto from "node:crypto";
import { type Database, type Connector } from "db0";
import { type H3Event } from "h3";

declare module "h3" {
    interface H3EventContext {
        auth: {
            hashPassword(password: string): string,
            generateSessionToken(): string,
            generateSessionId(sessionToken: string): string,

            createSession(userId: number): void,

            register(name: string, email: string, hash: string, typeId: number): void

            user: User | null
        }
    }
}

type User = {
    id: number,
    type: string,
    name: string
}

function hashPassword(password: string): string {
    return crypto.argon2Sync("argon2id", {
        memory: 65536,
        passes: 3,
        parallelism: 4,
        tagLength: 64,
        nonce: crypto.randomBytes(16),
        message: password
    }).toString("base64");
}

function generateSessionToken(): string {
    const bytes = crypto.randomBytes(24);
    return bytes.toString("base64");
}

function generateSessionId(sessionToken: string): string {
    const hasher = crypto.createHash("sha256");
    return hasher.update(sessionToken).digest("base64");
}

async function getUser(event: H3Event, db: Database, sessionToken?: string): Promise<User | null> {
    if (sessionToken == null) return null;

    const sessionId = generateSessionId(sessionToken);
    const sessionData = await db.sql`
        SELECT user_id, expires_at
        FROM sessions
        WHERE id = ${sessionId}
        LIMIT 1;
    `;

    if (!sessionData.success) {
        throw createError({
            data: sessionData.error,
            statusCode: 500
        });
    }

    if (sessionData.rows == null || sessionData.rows.length === 0) return null;

    const session = sessionData.rows[0] as { user_id: number, expires_at: Date };

    // Check if session expired
    if (session.expires_at < new Date()) {
        db.sql`
            DELETE FROM sessions
            WHERE id = ${sessionId};
        `;

        deleteCookie(event, "sessionToken");
        
        return null;
    }

    // Check if session expires in 15 days
    const DAYS_15_FROM_NOW = new Date(Date.now() + 1000 * 60 * 60 * 24 * 15);
    if (session.expires_at < DAYS_15_FROM_NOW) {
        db.sql`
            UPDATE sessions
            SET expires_at = ADDDATE(NOW(), INTERVAL 30 DAY)
            WHERE id = ${sessionId};
        `
    }

    const userData = await db.sql`
        SELECT users.id AS id, user_types.name AS type, users.name AS name
        FROM users
        INNER JOIN user_types
        ON users.type_id = user_types.id
        WHERE users.id = ${session.user_id}
        LIMIT 1;
    `;

    if (userData.rows == null) return null;

    const user = userData.rows[0] as { id: number, type: string, name: string };

    return user;
}

export default defineEventHandler(async (event) => {
    const db = useDatabase();

    const sessionToken = getCookie(event, "sessionToken");
    const user = await getUser(event, db, sessionToken);

    event.context.auth = {
        hashPassword,
        generateSessionToken,
        generateSessionId,

        user
    };
})