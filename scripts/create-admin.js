"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = require("dotenv");
// Load environment based on NODE_ENV similar to src/config/index.ts
const NODE_ENV = "production";
(0, dotenv_1.config)({ path: path_1.default.resolve(process.cwd(), `.env.${NODE_ENV}`) });
// Import Admin model without TS path aliases to avoid runtime resolver needs
const Admin_1 = __importStar(require("../src/api/v1/models/Admin"));
function parseArgs(argv) {
    const args = {};
    for (let i = 2; i < argv.length; i++) {
        const arg = argv[i];
        const next = argv[i + 1];
        const setKV = (key) => {
            if (next && !next.startsWith('--')) {
                args[key] = next;
                i++;
            }
            else {
                args[key] = 'true';
            }
        };
        if (arg === '--email')
            setKV('email');
        else if (arg === '--password')
            setKV('password');
        else if (arg === '--first')
            setKV('first');
        else if (arg === '--last')
            setKV('last');
        else if (arg === '--role')
            setKV('role');
        else if (arg === '--update')
            args.update = true;
    }
    return args;
}
function asAdminRole(value) {
    if (!value)
        return undefined;
    const v = value.toLowerCase();
    if (v === 'super-admin' || v === 'super_admin' || v === 'superadmin')
        return Admin_1.AdminRole.SUPER_ADMIN;
    if (v === 'admin')
        return Admin_1.AdminRole.ADMIN;
    if (v === 'manager')
        return Admin_1.AdminRole.MANAGER;
    if (v === 'accountant')
        return Admin_1.AdminRole.ACCOUNTANT;
    throw new Error(`Invalid role: ${value}. Use one of: super-admin, admin, manager, accountant`);
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const { DB_URI } = process.env;
        if (!DB_URI) {
            throw new Error('DB_URI is not set. Provide it in your environment (e.g., .env.development)');
        }
        const args = parseArgs(process.argv);
        const email = args.email || process.env.ADMIN_EMAIL;
        const password = args.password || process.env.ADMIN_PASSWORD;
        const firstName = args.first || process.env.ADMIN_FIRST_NAME || 'Admin';
        const lastName = args.last || process.env.ADMIN_LAST_NAME || 'User';
        const role = asAdminRole(args.role || process.env.ADMIN_ROLE || 'admin') || Admin_1.AdminRole.ADMIN;
        const allowUpdate = args.update || (process.env.ADMIN_UPDATE === 'true');
        if (!email)
            throw new Error('Missing --email (or ADMIN_EMAIL)');
        if (!password)
            throw new Error('Missing --password (or ADMIN_PASSWORD)');
        yield mongoose_1.default.connect(DB_URI);
        try {
            const existing = yield Admin_1.default.findOne({ email });
            if (existing) {
                if (!allowUpdate) {
                    throw new Error(`Admin with email ${email} already exists. Use --update to overwrite.`);
                }
                existing.firstName = firstName;
                existing.lastName = lastName;
                existing.role = role;
                existing.password = password; // will be hashed by pre-save hook
                existing.isActive = true;
                yield existing.save();
                // eslint-disable-next-line no-console
                console.log(`Updated admin ${email} (id: ${existing._id})`);
                return;
            }
            const admin = new Admin_1.default({
                firstName,
                lastName,
                email,
                role,
                password, // will be hashed by pre-save hook
                isActive: true,
            });
            yield admin.save();
            // eslint-disable-next-line no-console
            console.log(`Created admin ${email} (id: ${admin._id})`);
        }
        finally {
            yield mongoose_1.default.disconnect();
        }
    });
}
main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
});
