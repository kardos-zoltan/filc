import * as crypto from "node:crypto";
import { Primitive, type Database } from "db0";
import { Session, type H3Event } from "h3";

type SessionToken = string;
type HashedPassword = { hash: string, salt: string };

declare module "h3" {
    // Extend H3EventContext to include auth methods
    interface H3EventContext {
        auth: {
            /**
            * Hashes a string with a salt.
            * @param {string} password The string to be hashed.
            */
            hashPassword(password: string): HashedPassword,

            /**
            * Generates a 24 byte base64 session token.
            * @returns {string}  24 byte base64 session token. 
            */
            generateSessionToken(): string,

            /**
            * Generates a session id from a session token.
            * @param {string} sessionToken session token to be processed.
            * @returns {string} base64 session id. 
            */
            generateSessionId(sessionToken: SessionToken): string,

            /**
             * Creates and stores a user session in the database. 
             * @param userId User's id.
             * @returns {Promise<SessionToken>}
             */
            createSession(userId: number): Promise<SessionToken>,
            /**
             * Stores a user session inside browser cookies.
             * @param sessionToken The session token to be stored.
             */
            storeSessionInCookies(sessionToken: SessionToken): void,

            /**
            * Registers a new user.
            * @param name User's name.
            * @param email User's email.
            * @param hash User's password hash.
            * @returns {string} If email already in use.
            */
            register(name: string, email: string, hash: HashedPassword): Promise<string | undefined>,

            /**
            * Authenticates a user.
            * @param email The user's email.
            * @param password The user's password.
            * @returns {number} The user's id.
            */
            authenticate(email: string, password: string): Promise<number | "User not found" | "Incorrect password">

            /**
            * Unathenticates a user.
            * @returns {void}
            */
            unauthenticate(): void

            /**
             * Checks if a user is authenticated using the given sql string argument.
             * @param param must match a template string which would be given to `db.sql`
             */
            isAuthed(strings: TemplateStringsArray,  ...values: Primitive[]): Promise<boolean | Error>

            user: User | null
        }
    }
}

const COOKIES = {
    SESSION_TOKEN: "sessionToken"
};

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

/**
 * Gets user data from database
 * @param event server event
 * @param db database
 * @param sessionToken user's session token
 * @returns {Promise<User> | Null} Either the user's data, or null if no user found 
 */
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

            if (result.rows.length === 0) return false;
            
            return Object.values(result.rows[0] ?? {})[0] === 1;
        },

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