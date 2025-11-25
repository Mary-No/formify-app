import 'express-session';
import 'express-serve-static-core';


declare module 'express-session' {
    interface SessionData {
        userId?: string;
    }
}

declare module 'express-serve-static-core' {
    interface Request {
        user?: {
            id: string;
        }
    }
}
