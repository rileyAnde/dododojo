import request from 'supertest';
import express from 'express';
import bcrypt from 'bcrypt';

// Import the router
import user_services from '../src/routes/user_services-routes';

const app = express();
app.use(express.json());
app.use('/', user_services);


describe('User Services Routes', () => {
    const mockCompare = jest.spyOn(bcrypt, 'compareSync');
    const mockHash = jest.spyOn(bcrypt, 'hashSync');

    beforeEach(() => {
    jest.clearAllMocks();});

  //
  // GET /user/:username
  //
    describe('GET /user/:username', () => {
    it('should return 400 if username or password missing', async () => {
        const res = await request(app).post('/user/testuser').send({});
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Username and password are required');
    });
    it('should return 404 if user not found', async () => {
        const res = await request(app)
        .get('/user/unknownuser')
        .send({ password: 'password123' });

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('User not found');
    });
    it('should return 200 if password matches', async () => {
        mockCompare.mockReturnValue(true);

        const res = await request(app)
        .get('/user/testuser')
        .send({ password: 'password123' });

        expect(res.status).toBe(200);
        expect(res.body.account).toBeDefined();
        expect(res.body.account.username).toBe('testuser');
    });

    it('should return 401 if password does not match', async () => {
        mockCompare.mockReturnValue(false);

        const res = await request(app)
        .get('/user/testuser')
        .send({ password: 'wrongpassword' });

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Authentication failed');
    });
});

  //
  // POST /user/:username
  //
    describe('POST /user/:username', () => {
    it('should return 201 if valid account provided', async () => {
        mockHash.mockReturnValue('hashedpassword');

    const newAccount = {
        username: 'newuser',
        passwordHash: 'plaintextpassword',
    };

        const res = await request(app)
        .post('/user/newuser')
        .send({ account: newAccount });

        expect(res.status).toBe(201);
        expect(res.body.message).toBe('Account created successfully');
        expect(mockHash).toHaveBeenCalled();
    });

    it('should return 400 for invalid account data', async () => {
        const invalidAccount = { username: 'incomplete' };

        const res = await request(app)
        .post('/user/incomplete')
        .send({ account: invalidAccount });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Username and password are required');
    });
});

  //
  // PUT /user/:userId
  //
    describe('PUT /user/:userId', () => {
    it('should return 200 for valid update', async () => {
    const res = await request(app)
        .put('/user/1')
        .send({ updateData: { username: 'updateduser' } });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Service updated successfully');
    });

    it('should return 400 if updateData missing', async () => {
        const res = await request(app)
        .put('/user/1')
        .send({});

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Invalid update data');
    });
});

  //
  // DELETE /user/:userId
  //
    describe('DELETE /user/:userId', () => {
    it('should return 200 for valid delete', async () => {
        const res = await request(app).delete('/user/1');
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Service deleted successfully');
    });

    it('should return 400 if userId missing (invalid URL)', async () => {
        const res = await request(app).delete('/user/');
        expect(res.status).toBe(404); // Express will treat it as route not found
    });
    });
});
