import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import jwt from 'jsonwebtoken';
import authRouter from '../routes/api/auth.js';

test('GET and POST sign-out require authentication and return the same response', async t => {
    const secret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = 'test-secret';
    const token = jwt.sign({ id: '507f1f77bcf86cd799439011' }, process.env.JWT_SECRET);
    const app = express();
    app.use('/api/auth', authRouter);
    const server = await new Promise(resolve => {
        const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
    });
    t.after(() => {
        server.close();
        if (secret === undefined) delete process.env.JWT_SECRET;
        else process.env.JWT_SECRET = secret;
    });
    const url = `http://127.0.0.1:${server.address().port}/api/auth/signout`;
    for (const method of ['GET', 'POST']) {
        assert.equal((await fetch(url, { method })).status, 401);
        const response = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` } });
        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), { message: 'User signed out successfully', token: '' });
    }
});
