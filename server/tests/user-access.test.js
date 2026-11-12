import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/users.js';
import usersRouter from '../routes/api/users.js';

test('user management requires a valid admin account', async (t) => {
    const originalFindById = User.findById;
    const originalFind = User.find;
    const previousSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = 'test-secret';

    const id = '507f1f77bcf86cd799439011';
    const token = jwt.sign({ id }, process.env.JWT_SECRET);
    let account = { role: 'user' };
    User.findById = () => ({ select: async () => account });
    User.find = async () => [];

    const app = express();
    app.use('/api/users', usersRouter);
    const server = await new Promise((resolve) => {
        const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
    });

    t.after(() => {
        server.close();
        User.findById = originalFindById;
        User.find = originalFind;
        if (previousSecret === undefined) delete process.env.JWT_SECRET;
        else process.env.JWT_SECRET = previousSecret;
    });

    const base = `http://127.0.0.1:${server.address().port}/api/users`;
    const headers = { Authorization: `Bearer ${token}` };

    for (const [method, path] of [
        ['GET', ''], ['GET', `/${id}`], ['POST', ''],
        ['PUT', `/${id}`], ['DELETE', `/${id}`], ['DELETE', '']
    ]) {
        assert.equal((await fetch(base + path, { method })).status, 401);
        assert.equal((await fetch(base + path, { method, headers })).status, 403);
    }

    account = null;
    assert.equal((await fetch(base, { headers })).status, 401);

    account = { role: 'admin' };
    const response = await fetch(base, { headers });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), []);

    const malformedToken = jwt.sign({ id: 'not-an-object-id' }, process.env.JWT_SECRET);
    assert.equal((await fetch(base, {
        headers: { Authorization: `Bearer ${malformedToken}` }
    })).status, 401);
});
