import 'express-session';

declare module 'express-session' {
    interface SessionData {
        userId?: string;
        salesforce?: {
            access_token: string;
            instance_url: string;
            refresh_token: string;
            expires_at: number;
        };
    }
}