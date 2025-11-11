import request from 'supertest';
import express from 'express';
import bcrypt from 'bcrypt';
import user_services from '../src/routes/user_services-routes';

const app = express();
app.use(express.json());
app.use('/', user_services);

describe('User Services Routes - Integration Tests (real Rust server)', () => {
    const mockCompare = jest.spyOn(bcrypt, 'compareSync');
    const mockHash = jest.spyOn(bcrypt, 'hashSync');

    beforeEach(() => {
        jest.clearAllMocks();
        // No fetch mocking here
    });

    //
    // POST /users
    //
    it('should create a user successfully', async () => {
        const newAccount = { username: 'han101', passwordHash: 'plaintextpassword' };
        const res = await request(app).post('/users').send({ account: newAccount });
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Account created successfully');
        expect(mockHash).toHaveBeenCalled();
    });

    //
    // GET /user/:userid
    //
    it('should return user data from Rust server', async () => {
        mockCompare.mockReturnValue(true);
        const res = await request(app).get('/user/11').send({});
        expect(res.status).toBe(200);
        expect(res.body.account.username).toBe('han101');
    });

    //
    // PUT /user/:userid 
    //
    it('should update successfully', async () => {
        const res = await request(app)
            .put('/user/11')
            .send({
                updateData: {
                    id: 11,
                    username: 'han101',
                    password: "plaintextpassword",
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

    //
    // DELETE /user/:userId
    //
    it('should delete successfully', async () => {
        const res = await request(app).delete('/user/1');
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Service deleted successfully');
    });
});
