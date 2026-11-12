import test from 'node:test';
import assert from 'node:assert/strict';
import User from '../models/users.js';
import Project from '../models/projects.js';
import { signIn } from '../controllers/auth.controller.js';
import { updateProject } from '../controllers/projects.controller.js';

function response() {
    return {
        statusCode: 200,
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; }
    };
}

test('sign-in includes the account role without exposing its password', async (t) => {
    const original = User.findOne;
    const secret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = 'test-secret';
    User.findOne = async () => ({
        _id: '507f1f77bcf86cd799439011',
        name: 'Test',
        email: 'test@example.test',
        role: 'admin',
        comparePassword: async () => true
    });
    t.after(() => {
        User.findOne = original;
        if (secret === undefined) delete process.env.JWT_SECRET;
        else process.env.JWT_SECRET = secret;
    });
    const res = response();
    await signIn({ body: { email: 'test@example.test', password: 'test' } }, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.user.role, 'admin');
    assert.equal(res.body.user.password, undefined);
});

test('project updates use model validators', async (t) => {
    const original = Project.findByIdAndUpdate;
    let options;
    Project.findByIdAndUpdate = async (id, body, suppliedOptions) => {
        options = suppliedOptions;
        return { _id: id, ...body };
    };
    t.after(() => { Project.findByIdAndUpdate = original; });
    const res = response();
    await updateProject({ params: { id: 'example' }, body: { title: 'Updated' } }, res);
    assert.equal(res.statusCode, 200);
    assert.equal(options.runValidators, true);
    assert.equal(res.body.title, 'Updated');
});
