const bcrypt = require("bcrypt");
const { randomUUID } = require("crypto");
const { roleNames } = require("./roles");
const { courseCategories } = require("./courses");

const userStatuses = ["ACTIVE", "INACTIVE", "BLOCKED"];

const usersSchema = {
  tableName: "users",
  columns: {
    id: {
      type: "UUID",
      primaryKey: true,
      default: () => randomUUID(),
    },

    username: {
      type: "VARCHAR(255)",
      required: [true, "Username is required"],
      unique: true,
    },

    passwordHash: {
      dbName: "password_hash",
      type: "TEXT",
      required: [true, "Password is required"],
    },

    email: {
      type: "VARCHAR(255)",
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },

    fullName: {
      dbName: "full_name",
      type: "VARCHAR(150)",
      default: "",
    },

    avatarUrl: {
      dbName: "avatar_url",
      type: "TEXT",
      default: "https://i.sstatic.net/l60Hf.png",
    },

    status: {
      type: "VARCHAR(20)",
      default: "INACTIVE",
      enum: userStatuses,
      allowedValues: userStatuses,
    },

    roleId: {
      dbName: "role_id",
      type: "UUID",
      ref: "roles",
      required: [true, "Role is required"],
    },

    loginCount: {
      dbName: "login_count",
      type: "INTEGER",
      default: 0,
      min: [0, "Login count cannot be negative"],
    },

    isDeleted: {
      dbName: "is_deleted",
      type: "BOOLEAN",
      default: false,
    },

    forgotPasswordToken: {
      dbName: "forgot_password_token",
      type: "TEXT",
    },

    forgotPasswordTokenExp: {
      dbName: "forgot_password_token_exp",
      type: "TIMESTAMPTZ",
    },

    targetExam: {
      dbName: "target_exam",
      type: "VARCHAR(10)",
      enum: courseCategories,
      allowedValues: courseCategories,
    },

    lastLoginAt: {
      dbName: "last_login_at",
      type: "TIMESTAMPTZ",
    },
  },

  timestamps: true,
};

const userHooks = {
  beforeSave: function (payload: { password?: string; passwordHash?: string }) {
    if (!payload.password) {
      return payload;
    }

    let genSalt = bcrypt.genSaltSync(10);
    let newPass = bcrypt.hashSync(payload.password, genSalt);
    payload.passwordHash = newPass;
    delete payload.password;

    return payload;
  },
};

const createUsersTableSql = `
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(150) DEFAULT '',
  avatar_url TEXT DEFAULT 'https://i.sstatic.net/l60Hf.png',
  status VARCHAR(20) NOT NULL DEFAULT 'INACTIVE',
  role_id UUID NOT NULL REFERENCES roles(id),
  login_count INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  forgot_password_token TEXT,
  forgot_password_token_exp TIMESTAMPTZ,
  target_exam VARCHAR(10),
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_status_check CHECK (
    status IN ('ACTIVE', 'INACTIVE', 'BLOCKED')
  ),
  CONSTRAINT users_target_exam_check CHECK (
    target_exam IS NULL OR target_exam IN ('TOEIC', 'IELTS')
  ),
  CONSTRAINT users_login_count_check CHECK (login_count >= 0)
);

CREATE INDEX IF NOT EXISTS users_role_id_idx ON users (role_id);
`;

const roleNameById = {
  STUDENT: roleNames[0],
  TEACHER: roleNames[1],
  ADMIN: roleNames[2],
};

module.exports = {
  usersSchema,
  userHooks,
  createUsersTableSql,
  userStatuses,
  roleNameById,
};
