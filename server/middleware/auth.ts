import * as crypto from "node:crypto";
import { Primitive, type Database } from "db0";
import { type H3Event } from "h3";

type SessionToken = string;
type HashedPassword = { hash: string, salt: string };

declare module "h3" {
    interface H3EventContext {
        auth: {
            hashPassword(password: string): HashedPassword,
            generateSessionToken(): string,
            generateSessionId(sessionToken: SessionToken): string,

            createSession(userId: number): Promise<SessionToken>,
            storeSessionInCookies(sessionToken: SessionToken): void,

            register(name: string, email: string, hash: HashedPassword, typeId: number): void,
            authenticate(email: string, password: string): Promise<null | "User not found" | "Incorrect password">

            isAuthed(strings: TemplateStringsArray,  ...values: Primitive[]): Promise<boolean | Error>

            user: User | null
        }
    }
}

type User = {
    id: number,
    type: string,
    name: string
}

function hashPassword(password: string, salt: Buffer<ArrayBuffer> = crypto.randomBytes(16)): { hash: string, salt: string }  {    
    const hash = crypto.scryptSync(
        password,
        salt,
        128,
    );

    return {
        hash: hash.toString("base64"),
        salt: salt.toString("base64")
    }
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

        async createSession(userId: number): Promise<SessionToken> {
            const sessionToken = generateSessionToken();
            const sessionId = generateSessionId(sessionToken);

            db.sql`
                INSERT INTO sessions (id, user_id)
                VALUES (${sessionId}, ${userId})
            `;

            return sessionToken;
        },

        storeSessionInCookies(sessionToken) {
            const DAYS_30_FROM_NOW = 30 * 24 * 60 * 60;
            
            setCookie(event, "sessionToken", sessionToken, {
                httpOnly: true,
                maxAge: DAYS_30_FROM_NOW
            });
        },

        async isAuthed(strings, ...values) {
            if (this.user == null) return false;

            let result = await db.sql(strings, ...values);

            if (!result.rows) return new Error(result.error);

            return Object.values(result.rows[0])[0] === 1;
        },

        register(name, email, hash, typeId) {
            db.sql`
                INSERT INTO users (type_id, name, email, hash, salt)
                VALUES (${typeId}, ${name}, ${email}, ${hash.hash}, ${hash.salt})
            `;
        },

        async authenticate(email, password) {
            const userData = await db.sql`
                SELECT id, hash, salt
                FROM users
                WHERE email = ${email}
            `;

            if (userData.rows == null || userData.rows?.length === 0) return "User not found";

            const user = userData.rows[0] as { id: number, hash: string, salt: string };
            const salt = Buffer.from(user.salt, "base64");
            const hash = Buffer.from(user.hash, "base64");

            const hashedPassword = hashPassword(password, salt);

            if (!crypto.timingSafeEqual(hash, Buffer.from(hashedPassword.hash, "base64"))) return "Incorrect password";

            const sessionToken = await this.createSession(user.id);
            this.storeSessionInCookies(sessionToken);

            return null;
        },

        user
    };
})