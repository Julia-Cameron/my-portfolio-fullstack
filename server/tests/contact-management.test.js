import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/users.js';
import Contact from '../models/contacts.js';
import contactsRouter from '../routes/api/contacts.js';

test('contact submissions validate input and contact management is restricted to admins', async t => {
    const secret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = 'test-secret';
    const id = '507f1f77bcf86cd799439011';
    const token = jwt.sign({ id }, process.env.JWT_SECRET);
    const headers = { Authorization: `Bearer ${token}` };
    const jsonHeaders = { ...headers, 'Content-Type': 'application/json' };
    let account = { role: 'user' };
    let saved;
    let update;
    const originals = {
        userFind: User.findById, find: Contact.find, findById: Contact.findById,
        update: Contact.findByIdAndUpdate, remove: Contact.findByIdAndDelete,
        removeAll: Contact.deleteMany, save: Contact.prototype.save
    };
    User.findById = () => ({ select: async () => account });
    Contact.find = async () => [{ _id: id, message: 'private' }];
    Contact.findById = async () => ({ _id: id, message: 'private' });
    Contact.findByIdAndUpdate = async (itemId, data, options) => {
        update = { data, options };
        return { _id: itemId, ...data };
    };
    Contact.findByIdAndDelete = async () => ({ _id: id });
    Contact.deleteMany = async () => ({});
    Contact.prototype.save = async function () { saved = this.toObject(); return this; };
    const app = express();
    app.use(express.json());
    app.use('/contacts', contactsRouter);
    const server = await new Promise(resolve => {
        const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
    });
    t.after(() => {
        server.close();
        User.findById = originals.userFind;
        Contact.find = originals.find;
        Contact.findById = originals.findById;
        Contact.findByIdAndUpdate = originals.update;
        Contact.findByIdAndDelete = originals.remove;
        Contact.deleteMany = originals.removeAll;
        Contact.prototype.save = originals.save;
        if (secret === undefined) delete process.env.JWT_SECRET;
        else process.env.JWT_SECRET = secret;
    });
    const url = `http://127.0.0.1:${server.address().port}/contacts`;
    const data = { name: ' Example ', email: 'person@example.com', message: ' Hello ', firstname: 'ignored' };
    let response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), { message: 'Contact saved.' });
    assert.equal(saved.name, 'Example');
    assert.equal(saved.message, 'Hello');
    assert.equal(saved.firstname, undefined);
    for (const invalid of [{ ...data, message: '  ' }, { ...data, email: 'bad' }, { ...data, name: 'x'.repeat(121) }]) {
        response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(invalid) });
        assert.equal(response.status, 400);
    }
    for (const [method, path] of [['GET', ''], ['GET', `/${id}`], ['PUT', `/${id}`], ['DELETE', `/${id}`], ['DELETE', '']]) {
        const body = method === 'PUT' ? JSON.stringify(data) : undefined;
        const requestHeaders = method === 'PUT' ? jsonHeaders : headers;
        assert.equal((await fetch(url + path, { method, body, headers: method === 'PUT' ? { 'Content-Type': 'application/json' } : {} })).status, 401);
        account = { role: 'user' };
        assert.equal((await fetch(url + path, { method, body, headers: requestHeaders })).status, 403);
        account = { role: 'admin' };
        assert.equal((await fetch(url + path, { method, body, headers: requestHeaders })).status, 200);
    }
    assert.equal(update.options.runValidators, true);
    assert.deepEqual(update.data, { name: 'Example', email: 'person@example.com', message: 'Hello' });
    response = await fetch(`${url}/${id}`, { method: 'PUT', headers: jsonHeaders, body: JSON.stringify({ ...data, message: '' }) });
    assert.equal(response.status, 400);
});
