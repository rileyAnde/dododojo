import request from 'supertest';
import express from 'express';
import bcrypt from 'bcrypt';
import user_services from '../src/routes/user_services-routes.js';

const app = express();
app.use(express.json());
app.use('/', user_services);

describe('User Services Routes - Unit Tests (fetch mocked)', () => {
    const mockCompare = jest.spyOn(bcrypt, 'compareSync');
    const mockHash = jest.spyOn(bcrypt, 'hashSync');

    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn(); // Mock fetch
    });

    afterAll(() => {
        delete (global as any).fetch; // Clean up
    });

    //
    // POST /users
    //
    describe('POST /users', () => {
        it('should return 400 if username or password missing', async () => {
            const res = await request(app)
                .post('/users')
                .send({ account: { username: '', passwordHash: '' } });
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Username and password are required');
        });

        it('should create a user successfully', async () => {
            mockHash.mockReturnValue('hashedpassword');
            (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

            const newAccount = { username: 'seeduser', passwordHash: 'plaintextpassword' };

            const res = await request(app).post('/users').send({ account: newAccount });

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Account created successfully');
            expect(mockHash).toHaveBeenCalled();
        });
    });

    //
    // GET /user/:username
    //
    describe('GET /user/:username', () => {
        it('should return 404 if username is missing', async () => {
            const res = await request(app).get('/user/').send({});
            expect(res.status).toBe(404);
        });
        it('should return 200 when data correct', async () => {
            mockCompare.mockReturnValue(true);
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => ({
                    id: 1,
                    username: 'seeduser',
                    password: 'hashedpassword',
                    level: 5,
                    inventory: JSON.stringify({ '1': 2 }),
                    primary_deck: JSON.stringify([1]),
                    gyms_owned: JSON.stringify([]),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
            });
            const res = await request(app).get('/user/1').send({});
            expect(res.status).toBe(200);
            expect(res.body.account.username).toBe('seeduser');
        });
        it('should return 401 when password is wrong', async () => {
            mockCompare.mockReturnValue(false);

            (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ password: 'hashedpassword' })
            });

            const res = await request(app)
            .get('/user/seeduser')
            .send({ password: 'wrongpass' });
            
            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Incorrect Password');
        });
        it('should return 401 when username not found', async () => {
            (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 401 });

            const res = await request(app)
                .get('/user/nonexistentuser')
                .send({ password: 'anyPassword' });

            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Username Not Found');
        });
    });

    //
    // PUT /user/:username
    //
    describe('PUT /user/:username', () => {
        it('should update successfully', async () => {
            (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

            const res = await request(app)
                .put('/user/seeduser')
                .send({
                    updateData: {
                        id: 1,
                        user_name: 'seeduser',
                        password: "hashedpassword",
                        level: 10,
                        inventory: [
                            { id: 1, type: "attack", rank: 1, color: "red", fx: "fire" }
                        ],
                        primaryDeck: [
                            { id: 1, type: "attack", rank: 1, color: "red", fx: "fire" }
                        ],
                        gyms_owned: [],
                        created_at: '2025-11-07T22:31:31.380Z',
                        updated_at: new Date().toISOString()
                    }
                });

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Service updated successfully');
        });

        it('should return 400 if updateData missing', async () => {
            const res = await request(app).put('/user/seeduser').send({});
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('User ID and update data are required');
        });
    });

    //
    // DELETE /user/:userId
    //
    describe('DELETE /user/:userId', () => {
        beforeEach(() => {
        // Mock fetch so it returns a fake successful response
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            status: 200,
        });
    });
        it('should delete successfully', async () => {
            const res = await request(app).delete('/user/1');
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Service deleted successfully');
        });

        it('should return 400 if userId missing', async () => {
            const res = await request(app).delete('/user/');
            expect(res.status).toBe(404);
        });
    });
});
