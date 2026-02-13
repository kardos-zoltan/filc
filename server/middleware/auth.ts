import * as crypto from "node:crypto";
import { Primitive, type Database } from "db0";
import { type H3Event } from "h3";

type SessionToken = string;
type HashedPassword = { hash: string, salt: string };

declare module "h3" {
    // Extend H3EventContext to include auth methods
    interface H3EventContext {
        auth: {
            hashPassword(password: string): HashedPassword,
            generateSessionToken(): string,
            generateSessionId(sessionToken: SessionToken): string,

            createSession(userId: number): Promise<SessionToken>,
            storeSessionInCookies(sessionToken: SessionToken): void,

            register(name: string, email: string, hash: HashedPassword): Promise<string | undefined>,
            authenticate(email: string, password: string): Promise<number | "User not found" | "Incorrect password">
            unauthenticate(): void

            isAuthed(strings: TemplateStringsArray,  ...values: Primitive[]): Promise<boolean | Error>

            user: User | null
        }
    }
}

const COOKIES = {
    SESSION_TOKEN: "sessionToken"
};

// Hash a password with a random 16 byte salt
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

// Generate a random 24 byte session token
function generateSessionToken(): string {
    const bytes = crypto.randomBytes(24);
    return bytes.toString("base64");
}

// Generate a session ID from a session token
function generateSessionId(sessionToken: string): string {
    const hasher = crypto.createHash("sha256");
    return hasher.update(sessionToken).digest("base64");
}

// Get the user with a given session token
async function getUser(event: H3Event, db: Database, sessionToken?: string): Promise<User | null> {
    if (sessionToken == null) return null;

    // Get session data
    const sessionId = generateSessionId(sessionToken);
    const sessionData = await db.sql`
        SELECT user_id, expires_at
        FROM sessions
        WHERE id = ${sessionId}
        LIMIT 1;
    `;

    // If error, throw 500
    if (!sessionData.success) {
        throw createError({
            data: sessionData.error,
            statusCode: 500
        });
    }

    // Error handling
    if (sessionData.rows == null || sessionData.rows.length === 0) return null;

    const session = sessionData.rows[0] as { user_id: number, expires_at: Date };

    // Check if session expired
    if (session.expires_at < new Date()) {
        db.sql`
            DELETE FROM sessions
            WHERE id = ${sessionId};
        `;

        deleteCookie(event, COOKIES.SESSION_TOKEN);
        
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

    // Get user data
    const userData = await db.sql`
        SELECT users.id AS id, users.name AS name
        FROM users
        WHERE users.id = ${session.user_id}
        LIMIT 1;
    `;

    // Error handling
    if (userData.rows == null) return null;

    // Return user
    const user = userData.rows[0] as { id: number, type: string, name: string };

    return user;
}

export default defineEventHandler(async (event) => {
    const db = useDatabase();

    // Get session token from cookies, user from database
    const sessionToken = getCookie(event, COOKIES.SESSION_TOKEN);
    const user = await getUser(event, db, sessionToken);

    // Attach auth methods to event context
    event.context.auth = {
        hashPassword,
        generateSessionToken,
        generateSessionId,

        // Create a new session for a given user id
        async createSession(userId: number): Promise<SessionToken> {
            const sessionToken = generateSessionToken();
            const sessionId = generateSessionId(sessionToken);

            db.sql`
                INSERT INTO sessions (id, user_id)
                VALUES (${sessionId}, ${userId})
            `;

            return sessionToken;
        },

        // Store the session token in cookies, expiring in 30 days
        storeSessionInCookies(sessionToken) {
            const DAYS_30_FROM_NOW = 30 * 24 * 60 * 60;
            
            setCookie(event, COOKIES.SESSION_TOKEN, sessionToken, {
                httpOnly: true,
                maxAge: DAYS_30_FROM_NOW
            });
        },

        // Check if the user is authenticated by running a query
        async isAuthed(strings, ...values) {
            if (this.user == null) return false;

            let result = await db.sql(strings, ...values);

            if (!result.rows) return new Error(result.error);

            return Object.values(result.rows[0])[0] === 1;
        },

        // Register a new user
        async register(name, email, hash) {
            const res = await db.sql`
                INSERT INTO users (name, email, hash, salt)
                VALUES (${name}, ${email}, ${hash.hash}, ${hash.salt})
            `;

            if (res.error) {
                return "Az email foglalt!";
            }
        },

        async authenticate(email, password) {
            // Get user data
            const userData = await db.sql`
                SELECT id, hash, salt
                FROM users
                WHERE email = ${email}
            `;

            // Error handling
            if (userData.rows == null || userData.rows?.length === 0) return "User not found";

            // Get user hash and salt
            const user = userData.rows[0] as { id: number, hash: string, salt: string };
            const salt = Buffer.from(user.salt, "base64");
            const hash = Buffer.from(user.hash, "base64");

            // Hash the given password with the stored salt
            const hashedPassword = hashPassword(password, salt);

            // Compare hashes
            if (!crypto.timingSafeEqual(hash, Buffer.from(hashedPassword.hash, "base64"))) return "Incorrect password";

            return user.id;
        },

        unauthenticate() {
            // If no user, nothing to do
            if (!this.user) return;

            // Delete session from database and delete cookie
            const sessionToken = getCookie(event, COOKIES.SESSION_TOKEN);
            if (sessionToken == null) return;
            
            deleteCookie(event, COOKIES.SESSION_TOKEN, {
                httpOnly: true
            });
            
            const sessionId = generateSessionId(sessionToken);
            db.sql`DELETE FROM sessions WHERE id = ${sessionId}`
        },

        user
    };
})