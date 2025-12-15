-- Create admin user with hashed password
-- Password: Spiderman@3 (hashed with bcrypt, 12 rounds)
INSERT INTO "User" (id, email, "passwordHash", name, role, "createdAt", "updatedAt")
VALUES (
  'admin_001',
  'arunavtnt@gmail.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6QJw/2Ej6W',
  'Admin User',
  'ADMIN',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;
