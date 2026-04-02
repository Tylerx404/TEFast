const { randomUUID } = require("crypto");

const roleNames = ["STUDENT", "TEACHER", "ADMIN"];

const rolesSchema = {
  tableName: "roles",
  columns: {
    id: {
      type: "UUID",
      primaryKey: true,
      default: () => randomUUID(),
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
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY,
  name VARCHAR(20) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT roles_name_check CHECK (name IN ('STUDENT', 'TEACHER', 'ADMIN'))
);
`;

const seedRolesSql = `
INSERT INTO roles (id, name, description)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'STUDENT', 'Default learning role'),
  ('22222222-2222-2222-2222-222222222222', 'TEACHER', 'Course management role'),
  ('33333333-3333-3333-3333-333333333333', 'ADMIN', 'System administration role')
ON CONFLICT (name) DO NOTHING;
`;

module.exports = {
  roleNames,
  rolesSchema,
  createRolesTableSql,
  seedRolesSql,
};
