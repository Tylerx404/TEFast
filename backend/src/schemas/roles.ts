const roleNames = ["STUDENT", "TEACHER", "ADMIN"];

const rolesSchema = {
  tableName: "roles",
  columns: {
    id: {
      type: "UUID",
      primaryKey: true,
    },

    name: {
      type: "VARCHAR(20)",
      required: [true, "Role name is required"],
      unique: true,
      enum: roleNames,
      allowedValues: roleNames,
    },

    description: {
      type: "TEXT",
    },
  },

  timestamps: true,

  indexes: [
    {
      name: "roles_name_key",
      unique: true,
      columns: ["name"],
    },
  ],
};

const createRolesTableSql = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(20) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT roles_name_check CHECK (name IN ('STUDENT', 'TEACHER', 'ADMIN'))
);
`;

const seedRolesSql = `
INSERT INTO roles (name, description)
VALUES
  ('STUDENT', 'Default learning role'),
  ('TEACHER', 'Course management role'),
  ('ADMIN', 'System administration role')
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description;
`;

module.exports = {
  roleNames,
  rolesSchema,
  createRolesTableSql,
  seedRolesSql,
};
