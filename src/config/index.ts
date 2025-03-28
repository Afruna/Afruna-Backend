import { RolesInterface } from '@interfaces/Role.Interface';
import { config } from 'dotenv';
import path from 'path';
console.log(process.env.NODE_ENV)
if (process.env.NODE_ENV !== 'production') {
  config({ path: `.env.${process.env.NODE_ENV}` });
} else config({ path: path.resolve(__dirname, `../../.env.${process.env.NODE_ENV}`) });

export const MESSAGES = {
  DB_CONNECTED: 'database connected',
  ADMIN_SEEDED: 'admin seeded',
  INTERNAL_SERVER_ERROR: 'Internal Server Error. Please try again!',
  INVALID_CREDENTIALS: 'Invalid Credentials',
  LOGIN_SUCCESS: 'Login Success',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden access',
  INPUT_VALIDATION_ERROR: 'Input Validation Error',
  INVALID_REQUEST: 'Invalid Request',
  ROUTE_DOES_NOT_EXIST: 'Sorry Route does not exists',
  SERVER_STARTED: 'Server running on port',
  MONGODB_CONNECTED: 'DB Connected',
  MIN_PASSWORD_ERROR: 'password cannot be less than six',
  PASSWORD_MATCH_ERROR: 'password does not match',
  SEED_ACCOUNT_CREATED: 'Seeded',
  INVALID_EMAIL: 'invalid email',
  INVALID_TOKEN: 'invalid token',
  SHORT_PASSWORD: 'password must be at least 8 characters',
  USER_EXISTS: 'user exists',
  VENDOR_EXISTS: 'vendor exists',
  VENDOR_ALREADY_EXISTS: 'vendor already exists',
  INVALID_VENDOR_ACCOUNT: 'vendor does not exists',
  INVALID_RECORD: 'record does not exist',
  INVALID_SESSION: 'user does not have an active session',
  ACTIVE_SESSION: 'user session is active on another device. login again to reclaim session',
  DOC_NOT_FOUND: 'documentation url not found',
  PAYSTACK_NOT_INITIALIZED: 'paystack not initialized',
};

export const {
  PORT,
  DB_URI,
  JWT_KEY,
  JWT_TIMEOUT,
  REFRESH_JWT_KEY,
  REFRESH_JWT_TIMEOUT,
  GOOGLE_API_CLIENT_ID,
  GOOGLE_API_CLIENT_SECRET,
  GOOGLE_API_REDIRECT,
  FRONTEND_GOOGLE_LOGIN_URI,
  FACEBOOK_API_CLIENT_ID,
  FACEBOOK_API_CLIENT_SECRET,
  FACEBOOK_API_REDIRECT,
  FRONTEND_FACEBOOK_LOGIN_URI,
  APPLE_API_CLIENT_ID,
  APPLE_API_REDIRECT,
  APPLE_API_CLIENT_SECRET,
  APPLE_TEAM_ID,
  APPLE_KEY_IDENTIFIER,
  SMTP_SERVICE,
  SMTP_HOSTNAME,
  SMTP_PORT,
  SMTP_USERNAME,
  SMTP_PASSWORD,
  MAILJET_KEY,
  MAILJET_SECRET,
  MAILGUN_KEY,
  MAILGUN_DOMAIN,
  SEEDER_EMAIL,
  DOMAIN_EMAIL,
  COMPANY_ADDRESS,
  COMPANY_NAME,
  COMPANY_DOMAIN,
  SEEDER_PASSWORD,
  DOCS_URL,
  AWS_BUCKET_NAME,
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  SPACES_URL,
  SPACES_CDN_URL,
  SPACES_BUCKET_NAME,
  SPACES_REGION,
  SPACES_ACCESS_KEY_ID,
  SPACES_SECRET_ACCESS_KEY,
  PAYSTACK_SECRET,
  PAYSTACK_REDIRECT,
  ORDER_REDIRECT,
  WALLET_REDIRECT,
  PAYSTACK_BASE_URL,
  MULTER_STORAGE_PATH,
  NODE_ENV,
  REDIS_URI,
  VAT_FEE
} = <Record<string, string>>process.env;

export const CONSTANTS = {
  ROOT: path.join(__dirname, '..', '..'),
  ROOT_PATH: path.join(__dirname, '..', '..', MULTER_STORAGE_PATH || ''),
};

export const ROLES: RolesInterface = {
  admin: {
    booking: ['create', 'update', 'view', 'delete', 'addOptions', 'removeOption'],
    cart: ['create', 'update', 'view', 'delete', 'addOptions', 'removeOption'],
    category: ['create', 'update', 'view', 'delete', 'addOptions', 'removeOption'],
    conversation: ['create', 'update', 'view', 'delete', 'addOptions', 'removeOption'],
    message: ['create', 'update', 'view', 'delete', 'addOptions', 'removeOption'],
    order: ['create', 'update', 'view', 'delete', 'addOptions', 'removeOption'],
    product: ['view'],
    service: ['create', 'update', 'view', 'delete', 'addOptions', 'removeOption'],
    review: ['create', 'update', 'view', 'delete', 'addOptions', 'removeOption'],
    wallet: ['create', 'update', 'view', 'delete', 'addOptions', 'removeOption'],
    wishlist: ['create', 'update', 'view', 'delete', 'addOptions', 'removeOption'],
  },
  user: {
    booking: ['create', 'update', 'view', 'delete', 'addOptions', 'removeOption'],
    cart: ['create', 'update', 'view', 'delete', 'addOptions', 'removeOption'],
    category: ['view'],
    conversation: ['create', 'update', 'view', 'delete', 'addOptions', 'removeOption'],
    message: ['create', 'update', 'view', 'delete', 'addOptions', 'removeOption'],
    order: ['create', 'update', 'view', 'delete', 'addOptions', 'removeOption'],
    product: ['view'],
    service: ['create', 'update', 'view', 'delete', 'addOptions', 'removeOption'],
    review: ['create', 'update', 'view', 'delete', 'addOptions', 'removeOption'],
    wallet: ['create', 'update', 'view', 'delete', 'addOptions', 'removeOption'],
    wishlist: ['create', 'update', 'view', 'delete', 'addOptions', 'removeOption'],
  },
  provider: {
    booking: ['create', 'update', 'view', 'delete', 'addOptions', 'removeOption'],
    cart: ['create', 'update', 'view', 'delete', 'addOptions', 'removeOption'],
    category: ['view'],
    conversation: ['create', 'update', 'view', 'delete', 'addOptions', 'removeOption'],
    message: ['create', 'update', 'view', 'delete', 'addOptions', 'removeOption'],
    order: ['create', 'update', 'view', 'delete', 'addOptions', 'removeOption'],
    product: ['view'],
    service: ['create', 'update', 'view', 'delete', 'addOptions', 'removeOption'],
    review: ['create', 'update', 'view', 'delete', 'addOptions', 'removeOption'],
    wallet: ['create', 'update', 'view', 'delete', 'addOptions', 'removeOption'],
    wishlist: ['create', 'update', 'view', 'delete', 'addOptions', 'removeOption'],
  },
  vendor: {
    booking: ['create', 'update', 'view', 'delete', 'addOptions', 'removeOption'],
    cart: ['create', 'update', 'view', 'delete', 'addOptions', 'removeOption'],
    category: ['view'],
    conversation: ['create', 'update', 'view', 'delete', 'addOptions', 'removeOption'],
    message: ['create', 'update', 'view', 'delete', 'addOptions', 'removeOption'],
    order: ['create', 'update', 'view', 'delete', 'addOptions', 'removeOption'],
    product: ['create', 'update', 'view', 'delete'],
    service: ['create', 'update', 'view', 'delete', 'addOptions', 'removeOption'],
    review: ['create', 'update', 'view', 'delete', 'addOptions', 'removeOption'],
    wallet: ['create', 'update', 'view', 'delete', 'addOptions', 'removeOption'],
    wishlist: ['create', 'update', 'view', 'delete', 'addOptions', 'removeOption'],
  },
};

export const OPTIONS: {
  USE_ADMIN_SEED: boolean;
  USE_SMTP: boolean;
  USE_MAILJET: boolean;
  USE_MAILGUN: boolean;
  USE_SOCKETS: boolean;
  USE_AUTH_SESSIONS: boolean; // one user can log in at a time
  USE_REFRESH_TOKEN: boolean;
  USE_MULTER: boolean; // using multer without s3 or disk storage set default storage to memoryStorage
  USE_S3: boolean;
  USE_DIGITALOCEAN_SPACE: boolean; // s3 must be true to use this
  USE_MULTER_DISK_STORAGE: boolean; // s3 and USE_DIGITALOCEAN_SPACE  must be false to use this
  USE_OAUTH_GOOGLE: boolean;
  USE_OAUTH_FACEBOOK: boolean;
  USE_OAUTH_APPLE: boolean;
  USE_PAYSTACK: boolean;
  USE_ANALYTICS: boolean;
  USE_REDIS: boolean;
  USE_DATABASE: 'mongodb' | 'postgresql' | 'sqlite';
} = require(CONSTANTS.ROOT + '/appConfig.json');

export function optionsValidation() {
  if (!PORT || !DB_URI || !JWT_KEY || !JWT_TIMEOUT) {
    throw new Error('missing env config options: PORT, DB_URI, JWT_TIMEOUT, JWT_KEY');
  }

  if (OPTIONS.USE_ADMIN_SEED) {
    if (!SEEDER_EMAIL || !SEEDER_PASSWORD) {
      throw Error('missing env config options: SEEDER_EMAIL, SEEDER_PASSWORD');
    }
  }

  if (OPTIONS.USE_SMTP || OPTIONS.USE_MAILJET || OPTIONS.USE_MAILGUN) {
    if (
      (OPTIONS.USE_SMTP && (OPTIONS.USE_MAILJET || OPTIONS.USE_MAILGUN)) ||
      (OPTIONS.USE_MAILJET && OPTIONS.USE_MAILGUN)
    ) {
      throw new Error('USE_SMTP option, USE_MAILJET option and USE_MAILGUN cannot both be true');
    }

    if (OPTIONS.USE_SMTP) {
      if (!SMTP_PASSWORD || !DOMAIN_EMAIL || !COMPANY_ADDRESS || !COMPANY_NAME || !COMPANY_DOMAIN) {
        throw Error(
          'missing env config options: SMTP_PASSWORD, DOMAIN_EMAIL, COMPANY_ADDRESS, COMPANY_NAME, COMPANY_DOMAIN',
        );
      }
    }

    if (OPTIONS.USE_MAILJET) {
      if (!MAILJET_KEY || !MAILJET_SECRET) {
        throw Error('missing env config options: MAILJET_KEY, MAILJET_SECRET');
      }
    }

    if (OPTIONS.USE_MAILGUN) {
      if (!MAILGUN_KEY || !MAILGUN_DOMAIN) {
        throw Error('missing env config options: MAILGUN_KEY, MAILGUN_DOMAIN');
      }
    }
  }

  if (OPTIONS.USE_REDIS) {
    if (!REDIS_URI) {
      throw Error('missing env config options: REDIS_URI');
    }
  }

  if (OPTIONS.USE_PAYSTACK) {
    if (!PAYSTACK_SECRET) {
      throw Error('missing env config options: PAYSTACK_SECRET');
    }
  }

  if (OPTIONS.USE_MULTER_DISK_STORAGE) {
    if (!OPTIONS.USE_MULTER) {
      throw new Error('USE_MULTER option must be set to true to use USE_MULTER_DISK_STORAGE');
    }

    if (OPTIONS.USE_DIGITALOCEAN_SPACE || OPTIONS.USE_S3) {
      throw new Error('USE_S3 and USE_DIGITALOCEAN_SPACE option must be set to false to use USE_MULTER_DISK_STORAGE');
    }

    if (!MULTER_STORAGE_PATH) {
      throw new Error('missing env config options: MULTER_STORAGE_PATH');
    }
  }

  // if (OPTIONS.USE_DIGITALOCEAN_SPACE) {
  //   if (!OPTIONS.USE_S3) {
  //     throw new Error('USE_S3 option must be set to true to use USE_DIGITALOCEAN_SPACE');
  //   }
  // }

  if (OPTIONS.USE_REFRESH_TOKEN) {
    if (!REFRESH_JWT_KEY || !REFRESH_JWT_TIMEOUT) {
      throw Error('missing env config options: REFRESH_JWT_KEY, REFRESH_JWT_TIMEOUT');
    }
  }

  if (OPTIONS.USE_S3 || OPTIONS.USE_DIGITALOCEAN_SPACE) {
    if (OPTIONS.USE_S3 && OPTIONS.USE_DIGITALOCEAN_SPACE) {
      throw new Error('USE_S3 option and USE_DIGITALOCEAN_SPACE option cannot both be true');
    }

    if (!OPTIONS.USE_MULTER) {
      throw new Error('USE_MULTER option must be set to true to use USE_S3');
    }

    if (OPTIONS.USE_S3 && (!AWS_BUCKET_NAME || !AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY)) {
      throw new Error(
        'missing env config options: AWS_BUCKET_NAME, AWS_REGION, AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY',
      );
    }

    if (
      OPTIONS.USE_DIGITALOCEAN_SPACE &&
      (!SPACES_BUCKET_NAME || !SPACES_REGION || !SPACES_ACCESS_KEY_ID || !SPACES_SECRET_ACCESS_KEY)
    ) {
      throw new Error(
        'missing env config options: SPACES_BUCKET_NAME, SPACES_REGION, SPACES_ACCESS_KEY_ID SPACES_SECRET_ACCESS_KEY',
      );
    }
  }

  if (OPTIONS.USE_OAUTH_GOOGLE) {
    if (!GOOGLE_API_CLIENT_ID || !GOOGLE_API_CLIENT_SECRET || !GOOGLE_API_REDIRECT) {
      throw new Error(
        'missing env config options: GOOGLE_API_CLIENT_ID, GOOGLE_API_CLIENT_SECRET, GOOGLE_API_REDIRECT',
      );
    }
  }

  if (OPTIONS.USE_OAUTH_FACEBOOK) {
    if (!FACEBOOK_API_CLIENT_ID || !FACEBOOK_API_CLIENT_SECRET || !FACEBOOK_API_REDIRECT) {
      throw new Error(
        'missing env config options:  FACEBOOK_API_CLIENT_ID, FACEBOOK_API_CLIENT_SECRET, FACEBOOK_API_REDIRECT',
      );
    }
  }

  if (OPTIONS.USE_OAUTH_APPLE) {
    if (
      !APPLE_API_CLIENT_ID ||
      !APPLE_API_REDIRECT ||
      !APPLE_API_CLIENT_SECRET ||
      !APPLE_TEAM_ID ||
      !APPLE_KEY_IDENTIFIER
    ) {
      throw new Error(
        'missing env config options: APPLE_API_CLIENT_ID, APPLE_API_REDIRECT, APPLE_API_CLIENT_SECRET, APPLE_TEAM_ID, APPLE_KEY_IDENTIFIER ',
      );
    }
  }
}
