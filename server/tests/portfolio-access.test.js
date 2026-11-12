import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/users.js';
import Project from '../models/projects.js';
import Qualification from '../models/qualifications.js';
import Service from '../models/services.js';
import projectsRouter from '../routes/api/projects.js';
import qualificationsRouter from '../routes/api/qualifications.js';
import servicesRouter from '../routes/api/services.js';

test('portfolio resources are publicly readable and writable only by admins', async (t) => {
    const secret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = 'test-secret';
    const id = '507f1f77bcf86cd799439011';
    const headers = { Authorization: `Bearer ${jwt.sign({ id }, process.env.JWT_SECRET)}` };
    let account = { role: 'user' };
    const originalUserFind = User.findById;
    User.findById = () => ({ select: async () => account });

    const models = [Project, Qualification, Service];
    for (const model of models) {
        const originals = {
            find: model.find,
            findById: model.findById,
            findByIdAndUpdate: model.findByIdAndUpdate,
            findByIdAndDelete: model.findByIdAndDelete,
            deleteMany: model.deleteMany,
            save: model.prototype.save
        };
        model.find = async () => [];
        model.findById = async () => ({ _id: id });
        model.findByIdAndUpdate = async () => ({ _id: id });
        model.findByIdAndDelete = async () => ({ _id: id });
        model.deleteMany = async () => ({});
        model.prototype.save = async function () { return this; };
        t.after(() => {
            Object.assign(model, {
                find: originals.find,
                findById: originals.findById,
                findByIdAndUpdate: originals.findByIdAndUpdate,
                findByIdAndDelete: originals.findByIdAndDelete,
                deleteMany: originals.deleteMany
            });
            model.prototype.save = originals.save;
        });
    }

    const app = express();
    app.use(express.json());
    app.use('/projects', projectsRouter);
    app.use('/qualifications', qualificationsRouter);
    app.use('/services', servicesRouter);
    const server = await new Promise((resolve) => {
        const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
    });
    t.after(() => {
        server.close();
        User.findById = originalUserFind;
        if (secret === undefined) delete process.env.JWT_SECRET;
        else process.env.JWT_SECRET = secret;
    });

    const base = `http://127.0.0.1:${server.address().port}`;
    for (const resource of ['projects', 'qualifications', 'services']) {
        const url = `${base}/${resource}`;
        for (const path of ['', `/${id}`]) {
            assert.equal((await fetch(url + path)).status, 200);
        }
        for (const [method, path] of [
            ['POST', ''], ['PUT', `/${id}`], ['DELETE', `/${id}`], ['DELETE', '']
        ]) {
            account = { role: 'user' };
            assert.equal((await fetch(url + path, { method })).status, 401);
            assert.equal((await fetch(url + path, { method, headers })).status, 403);
            account = { role: 'admin' };
            const response = await fetch(url + path, { method, headers });
            assert.equal(response.status, method === 'POST' ? 201 : 200);
        }
    }
});
