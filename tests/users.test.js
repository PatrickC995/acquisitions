import request from 'supertest';
import { jest } from '@jest/globals';

jest.unstable_mockModule('#services/users.services.js', () => ({
  getAllUsers: jest.fn(),
  getUserById: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
}));

jest.unstable_mockModule('#middleware/auth.middleware.js', () => ({
  authenticate: jest.fn((req, res, next) => {
    req.user = {
      id: 1,
      role: 'user',
    };

    next();
  }),
}));

jest.unstable_mockModule('#middleware/security.middleware.js', () => ({
  default: jest.fn((req, res, next) => {
    next();
  }),
}));

const { default: app } = await import('#src/app.js');

const { getAllUsers, getUserById, updateUser, deleteUser } =
  await import('#services/users.services.js');

const { authenticate } = await import('#middleware/auth.middleware.js');

const normalUser = {
  id: 1,
  name: 'Test User',
  email: '[user@test.com](mailto:user@test.com)',
  role: 'user',
};

const anotherUser = {
  id: 2,
  name: 'Another User',
  email: '[another@test.com](mailto:another@test.com)',
  role: 'user',
};

const adminUser = {
  id: 3,
  name: 'Test Admin',
  email: '[admin@test.com](mailto:admin@test.com)',
  role: 'admin',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/users', () => {
  it('should allow an admin to fetch all users', async () => {
    authenticate.mockImplementation((req, res, next) => {
      req.user = adminUser;
      next();
    });

    getAllUsers.mockResolvedValue([adminUser, normalUser, anotherUser]);

    const response = await request(app).get('/api/users').expect(200);

    expect(response.body).toEqual({
      success: true,
      data: [adminUser, normalUser, anotherUser],
    });

    expect(getAllUsers).toHaveBeenCalled();
  });

  it('should prevent a normal user from fetching all users', async () => {
    authenticate.mockImplementation((req, res, next) => {
      req.user = normalUser;
      next();
    });

    const response = await request(app).get('/api/users').expect(403);

    expect(response.body).toEqual({
      success: false,
      message: 'Only admin users can fetch all users',
    });

    expect(getAllUsers).not.toHaveBeenCalled();
  });
});

describe('GET /api/users/get/:id', () => {
  it('should allow a user to access their own information', async () => {
    authenticate.mockImplementation((req, res, next) => {
      req.user = normalUser;
      next();
    });

    getUserById.mockResolvedValue(normalUser);

    const response = await request(app).get('/api/users/get/1').expect(200);

    expect(response.body).toEqual({
      success: true,
      data: normalUser,
    });

    expect(getUserById).toHaveBeenCalledWith(1);
  });

  it('should prevent a user from accessing another user', async () => {
    authenticate.mockImplementation((req, res, next) => {
      req.user = normalUser;
      next();
    });

    const response = await request(app).get('/api/users/get/2').expect(403);

    expect(response.body).toEqual({
      success: false,
      message: 'You can only access your own information',
    });

    expect(getUserById).not.toHaveBeenCalled();
  });

  it('should allow an admin to access another user', async () => {
    authenticate.mockImplementation((req, res, next) => {
      req.user = adminUser;
      next();
    });

    getUserById.mockResolvedValue(anotherUser);

    const response = await request(app).get('/api/users/get/2').expect(200);

    expect(response.body).toEqual({
      success: true,
      data: anotherUser,
    });

    expect(getUserById).toHaveBeenCalledWith(2);
  });

  it('should return 404 when the user does not exist', async () => {
    authenticate.mockImplementation((req, res, next) => {
      req.user = adminUser;
      next();
    });

    getUserById.mockRejectedValue(new Error('User not found'));

    const response = await request(app).get('/api/users/get/999').expect(404);

    expect(response.body).toEqual({
      success: false,
      message: 'User not found',
    });
  });
});

describe('PUT /api/users/update/:id', () => {
  it('should allow a user to update their own information', async () => {
    authenticate.mockImplementation((req, res, next) => {
      req.user = normalUser;
      next();
    });

    const updatedUser = {
      ...normalUser,
      name: 'Updated Name',
    };

    updateUser.mockResolvedValue(updatedUser);

    const response = await request(app)
      .put('/api/users/update/1')
      .send({
        name: 'Updated Name',
      })
      .expect(200);

    expect(response.body).toEqual({
      success: true,
      message: 'Update successful',
      data: updatedUser,
    });

    expect(updateUser).toHaveBeenCalledWith(1, {
      name: 'Updated Name',
    });
  });

  it('should prevent a user from updating another user', async () => {
    authenticate.mockImplementation((req, res, next) => {
      req.user = normalUser;
      next();
    });

    const response = await request(app)
      .put('/api/users/update/2')
      .send({
        name: 'Hacked Name',
      })
      .expect(403);

    expect(response.body).toEqual({
      success: false,
      message: 'You can only update your own information',
    });

    expect(updateUser).not.toHaveBeenCalled();
  });

  it('should prevent a normal user from changing their role', async () => {
    authenticate.mockImplementation((req, res, next) => {
      req.user = normalUser;
      next();
    });

    const response = await request(app)
      .put('/api/users/update/1')
      .send({
        role: 'admin',
      })
      .expect(403);

    expect(response.body).toEqual({
      success: false,
      message: 'Only admin users can change user roles',
    });

    expect(updateUser).not.toHaveBeenCalled();
  });

  it('should allow an admin to update another user', async () => {
    authenticate.mockImplementation((req, res, next) => {
      req.user = adminUser;
      next();
    });

    const updatedUser = {
      ...anotherUser,
      name: 'Updated By Admin',
    };

    updateUser.mockResolvedValue(updatedUser);

    const response = await request(app)
      .put('/api/users/update/2')
      .send({
        name: 'Updated By Admin',
      })
      .expect(200);

    expect(response.body).toEqual({
      success: true,
      message: 'Update successful',
      data: updatedUser,
    });

    expect(updateUser).toHaveBeenCalledWith(2, {
      name: 'Updated By Admin',
    });
  });
});

describe('DELETE /api/users/delete/:id', () => {
  it('should allow an admin to delete a user', async () => {
    authenticate.mockImplementation((req, res, next) => {
      req.user = adminUser;
      next();
    });

    deleteUser.mockResolvedValue(undefined);

    const response = await request(app)
      .delete('/api/users/delete/2')
      .expect(200);

    expect(response.body).toEqual({
      success: true,
      message: 'User deleted successfully',
    });

    expect(deleteUser).toHaveBeenCalledWith(2);
  });

  it('should prevent a normal user from deleting users', async () => {
    authenticate.mockImplementation((req, res, next) => {
      req.user = normalUser;
      next();
    });

    const response = await request(app)
      .delete('/api/users/delete/2')
      .expect(403);

    expect(response.body).toEqual({
      success: false,
      message: 'Only admin users can delete users',
    });

    expect(deleteUser).not.toHaveBeenCalled();
  });

  it('should return 404 when the user does not exist', async () => {
    authenticate.mockImplementation((req, res, next) => {
      req.user = adminUser;
      next();
    });

    deleteUser.mockRejectedValue(new Error('User not found'));

    const response = await request(app)
      .delete('/api/users/delete/999')
      .expect(404);

    expect(response.body).toEqual({
      success: false,
      message: 'User not found',
    });
  });
});
