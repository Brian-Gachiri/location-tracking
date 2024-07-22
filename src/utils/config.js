import { config } from 'dotenv';
config({ path: `.env` });

export const CREDENTIALS = process.env.CREDENTIALS === 'true';

export const {
    API_KEY,
    NODE_ENV,
    PORT,
    SECRET_KEY,
    LOG_FORMAT,
    LOG_DIR,
    ORIGIN,
    MAPBOX_ACCESS_TOKEN

} = process.env;