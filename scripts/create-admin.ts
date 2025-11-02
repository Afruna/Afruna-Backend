import mongoose from 'mongoose';
import path from 'path';
import { config as dotenvConfig } from 'dotenv';

// Load environment based on NODE_ENV similar to src/config/index.ts
const NODE_ENV = process.env.NODE_ENV || 'development';
dotenvConfig({ path: path.resolve(process.cwd(), `.env.${NODE_ENV}`) });

// Import Admin model without TS path aliases to avoid runtime resolver needs
import Admin, { AdminRole } from '../src/api/v1/models/Admin';

type Args = {
  email?: string;
  password?: string;
  first?: string;
  last?: string;
  role?: string;
  update?: boolean;
};

function parseArgs(argv: string[]): Args {
  const args: Args = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];
    const setKV = (key: keyof Args) => {
      if (next && !next.startsWith('--')) {
        (args as any)[key] = next;
        i++;
      } else {
        (args as any)[key] = 'true';
      }
    };

    if (arg === '--email') setKV('email');
    else if (arg === '--password') setKV('password');
    else if (arg === '--first') setKV('first');
    else if (arg === '--last') setKV('last');
    else if (arg === '--role') setKV('role');
    else if (arg === '--update') args.update = true;
  }
  return args;
}

function asAdminRole(value?: string): AdminRole | undefined {
  if (!value) return undefined;
  const v = value.toLowerCase();
  if (v === 'super-admin' || v === 'super_admin' || v === 'superadmin') return AdminRole.SUPER_ADMIN;
  if (v === 'admin') return AdminRole.ADMIN;
  if (v === 'manager') return AdminRole.MANAGER;
  if (v === 'accountant') return AdminRole.ACCOUNTANT;
  throw new Error(`Invalid role: ${value}. Use one of: super-admin, admin, manager, accountant`);
}

async function main() {
  const { DB_URI } = process.env as Record<string, string | undefined>;
  if (!DB_URI) {
    throw new Error('DB_URI is not set. Provide it in your environment (e.g., .env.development)');
  }

  const args = parseArgs(process.argv);
  const email = args.email || process.env.ADMIN_EMAIL;
  const password = args.password || process.env.ADMIN_PASSWORD;
  const firstName = args.first || process.env.ADMIN_FIRST_NAME || 'Admin';
  const lastName = args.last || process.env.ADMIN_LAST_NAME || 'User';
  const role = asAdminRole(args.role || process.env.ADMIN_ROLE || 'admin') || AdminRole.ADMIN;
  const allowUpdate = args.update || (process.env.ADMIN_UPDATE === 'true');

  if (!email) throw new Error('Missing --email (or ADMIN_EMAIL)');
  if (!password) throw new Error('Missing --password (or ADMIN_PASSWORD)');

  await mongoose.connect(DB_URI);

  try {
    const existing = await Admin.findOne({ email });

    if (existing) {
      if (!allowUpdate) {
        throw new Error(`Admin with email ${email} already exists. Use --update to overwrite.`);
      }
      existing.firstName = firstName;
      existing.lastName = lastName;
      existing.role = role;
      existing.password = password; // will be hashed by pre-save hook
      existing.isActive = true;
      await existing.save();
      // eslint-disable-next-line no-console
      console.log(`Updated admin ${email} (id: ${existing._id})`);
      return;
    }

    const admin = new Admin({
      firstName,
      lastName,
      email,
      role,
      password, // will be hashed by pre-save hook
      isActive: true,
    });

    await admin.save();
    // eslint-disable-next-line no-console
    console.log(`Created admin ${email} (id: ${admin._id})`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});


