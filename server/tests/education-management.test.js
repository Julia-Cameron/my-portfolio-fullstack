import test from 'node:test';
import assert from 'node:assert/strict';
import Qualification from '../models/qualifications.js';
import { updateQualification } from '../controllers/qualifications.controller.js';

test('ongoing status is optional for older records and persists when provided', async () => {
    const data = { title: 'Example', firstname: 'First', lastname: 'Last', email: 'public@example.com' };
    const legacy = new Qualification(data);
    const ongoing = new Qualification({ ...data, isOngoing: true });
    assert.equal(legacy.isOngoing, undefined);
    assert.equal(ongoing.toObject().isOngoing, true);
    await ongoing.validate();
});

test('education updates enable model validators', async (t) => {
    const original = Qualification.findByIdAndUpdate;
    let options;
    Qualification.findByIdAndUpdate = async (id, body, suppliedOptions) => {
        options = suppliedOptions;
        return { _id: id, ...body };
    };
    t.after(() => { Qualification.findByIdAndUpdate = original; });
    const res = {
        statusCode: 200,
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; }
    };
    await updateQualification({ params: { id: 'example' }, body: { title: 'Updated' } }, res);
    assert.equal(res.statusCode, 200);
    assert.equal(options.runValidators, true);
    assert.equal(res.body.title, 'Updated');
});
