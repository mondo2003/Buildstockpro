import { Elysia } from 'elysia';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';
import * as userService from '../services/userService';

export function userRoutes(app: Elysia) {
  return app.group('/api/users', (app) => {
    // List users with pagination and filters
    app.get('/', async ({ query }) => {
      try {
        const page = query.page ? parseInt(query.page as string) : 1;
        const limit = query.limit ? parseInt(query.limit as string) : 20;
        const search = query.search as string;
        const role = query.role as string;

        const { users, total } = await userService.getUsers(page, limit, search, role);

        return paginatedResponse(users, page, limit, total);
      } catch (error) {
        console.error('Error fetching users:', error);
        return errorResponse('Failed to fetch users', (error as Error).message);
      }
    });

    // Get single user
    app.get('/:id', async ({ params }) => {
      try {
        const user = await userService.getUserById(params.id);

        if (!user) {
          return errorResponse('User not found', 'No user found with the provided ID');
        }

        return successResponse(user);
      } catch (error) {
        console.error('Error fetching user:', error);
        return errorResponse('Failed to fetch user', (error as Error).message);
      }
    });

    // Create user
    app.post('/', async ({ body }) => {
      try {
        const input = body as userService.CreateUserInput;
        const user = await userService.createUser(input);

        return successResponse(user, 'User created successfully');
      } catch (error) {
        console.error('Error creating user:', error);
        return errorResponse('Failed to create user', (error as Error).message);
      }
    });

    // Update user
    app.put('/:id', async ({ params, body }) => {
      try {
        const input = body as userService.UpdateUserInput;
        const user = await userService.updateUser(params.id, input);

        if (!user) {
          return errorResponse('User not found', 'No user found with the provided ID');
        }

        return successResponse(user, 'User updated successfully');
      } catch (error) {
        console.error('Error updating user:', error);
        return errorResponse('Failed to update user', (error as Error).message);
      }
    });

    // Delete user
    app.delete('/:id', async ({ params }) => {
      try {
        const deleted = await userService.deleteUser(params.id);

        if (!deleted) {
          return errorResponse('User not found', 'No user found with the provided ID');
        }

        return successResponse(null, 'User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        return errorResponse('Failed to delete user', (error as Error).message);
      }
    });

    // Ban user
    app.post('/:id/ban', async ({ params, body }) => {
      try {
        const { reason } = body as { reason: string };

        if (!reason) {
          return errorResponse('Missing reason', 'Ban reason is required');
        }

        const user = await userService.banUser(params.id, reason);

        if (!user) {
          return errorResponse('User not found', 'No user found with the provided ID');
        }

        return successResponse(user, 'User banned successfully');
      } catch (error) {
        console.error('Error banning user:', error);
        return errorResponse('Failed to ban user', (error as Error).message);
      }
    });

    // Unban user
    app.post('/:id/unban', async ({ params }) => {
      try {
        const user = await userService.unbanUser(params.id);

        if (!user) {
          return errorResponse('User not found', 'No user found with the provided ID');
        }

        return successResponse(user, 'User unbanned successfully');
      } catch (error) {
        console.error('Error unbanning user:', error);
        return errorResponse('Failed to unban user', (error as Error).message);
      }
    });

    return app;
  });
}
