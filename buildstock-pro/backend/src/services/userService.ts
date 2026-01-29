import { query, queryOne } from '../utils/database';

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  isBanned: boolean;
  banReason: string | null;
  emailVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  fullName?: string;
  role?: 'user' | 'moderator' | 'admin';
  password?: string;
}

export interface UpdateUserInput {
  email?: string;
  fullName?: string;
  role?: 'user' | 'moderator' | 'admin';
  isBanned?: boolean;
  banReason?: string;
  emailVerified?: boolean;
}

export async function getUsers(
  page: number = 1,
  limit: number = 20,
  search?: string,
  role?: string
): Promise<{ users: User[]; total: number }> {
  const offset = (page - 1) * limit;
  let whereClause = '';
  const params: any[] = [];

  if (search) {
    whereClause += ' WHERE (email ILIKE $1 OR full_name ILIKE $1)';
    params.push(`%${search}%`);
  }

  if (role) {
    const paramIndex = params.length + 1;
    if (whereClause) {
      whereClause += ` AND role = $${paramIndex}`;
    } else {
      whereClause += ` WHERE role = $${paramIndex}`;
    }
    params.push(role);
  }

  const countResult = await queryOne(
    `SELECT COUNT(*) as count FROM users${whereClause}`,
    params
  );
  const total = Number(countResult?.count || 0);

  const users = await query<User>(
    `SELECT * FROM users${whereClause} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );

  return { users, total };
}

export async function getUserById(id: string): Promise<User | null> {
  return await queryOne<User>('SELECT * FROM users WHERE id = $1', [id]);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return await queryOne<User>('SELECT * FROM users WHERE email = $1', [email]);
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const { email, fullName, role = 'user' } = input;

  const result = await queryOne<User>(
    `INSERT INTO users (email, full_name, role, email_verified)
     VALUES ($1, $2, $3, true)
     RETURNING *`,
    [email, fullName || null, role]
  );

  if (!result) {
    throw new Error('Failed to create user');
  }

  return result;
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<User | null> {
  const updates: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  Object.entries(input).forEach(([key, value]) => {
    if (value !== undefined) {
      const column = key === 'isBanned' ? 'is_banned' :
                     key === 'banReason' ? 'ban_reason' :
                     key === 'emailVerified' ? 'email_verified' :
                     key === 'fullName' ? 'full_name' :
                     key;
      updates.push(`${column} = $${paramIndex++}`);
      params.push(value);
    }
  });

  if (updates.length === 0) {
    return await getUserById(id);
  }

  params.push(id);

  const result = await queryOne<User>(
    `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    params
  );

  return result;
}

export async function deleteUser(id: string): Promise<boolean> {
  const result = await queryOne('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
  return !!result;
}

export async function banUser(id: string, reason: string): Promise<User | null> {
  return await updateUser(id, { isBanned: true, banReason: reason });
}

export async function unbanUser(id: string): Promise<User | null> {
  return await updateUser(id, { isBanned: false, banReason: null });
}
