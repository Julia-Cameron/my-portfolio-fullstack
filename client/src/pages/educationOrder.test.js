import test from 'node:test';
import assert from 'node:assert/strict';
import { isOngoingEducation, sortEducation } from './educationOrder.js';

test('sorts ongoing, dated, legacy year, and unknown records without mutating input', () => {
    const records = [
        { title: 'Unknown', studyPeriod: 'in the past' },
        { title: 'Legacy 2006', studyPeriod: '2001 - 2006' },
        { title: 'Completed 2024', completion: '2024-06-15T00:00:00.000Z' },
        { title: 'Legacy ongoing', studyPeriod: 'January 2026 - present' },
        { title: 'Completed 2021', completion: '2021-01-01T00:00:00.000Z' },
        { title: 'Ongoing', isOngoing: true },
        { title: 'Explicitly not ongoing', isOngoing: false, studyPeriod: '2020 - present' }
    ];
    const before = [...records];
    assert.deepEqual(sortEducation(records).map(item => item.title), [
        'Legacy ongoing', 'Ongoing', 'Completed 2024', 'Completed 2021',
        'Legacy 2006', 'Unknown', 'Explicitly not ongoing'
    ]);
    assert.deepEqual(records, before);
});

test('uses explicit state and dates over legacy text', () => {
    assert.equal(isOngoingEducation({ isOngoing: false, studyPeriod: '2020 - present' }), false);
    assert.equal(isOngoingEducation({ completion: '2022-01-01', studyPeriod: '2020 - present' }), false);
    assert.equal(isOngoingEducation({ studyPeriod: 'present' }), false);
    const sorted = sortEducation([
        { title: 'Year-only', studyPeriod: '2001 - 2006' },
        { title: 'Exact date', completion: '2006-06-15' }
    ]);
    assert.deepEqual(sorted.map(item => item.title), ['Exact date', 'Year-only']);
});

test('reorders after adding or editing a record and keeps ties stable', () => {
    let records = [
        { title: 'First', completion: '2022-01-01' },
        { title: 'Second', completion: '2022-01-01' }
    ];
    assert.deepEqual(sortEducation(records).map(item => item.title), ['First', 'Second']);
    records = [...records, { title: 'New', completion: '2023-01-01' }];
    assert.deepEqual(sortEducation(records).map(item => item.title), ['New', 'First', 'Second']);
    records = records.map(item => item.title === 'Second' ? { ...item, isOngoing: true } : item);
    assert.deepEqual(sortEducation(records).map(item => item.title), ['Second', 'New', 'First']);
    records = records.map(item => item.title === 'New' ? { ...item, completion: 'invalid' } : item);
    assert.deepEqual(sortEducation(records).map(item => item.title), ['Second', 'First', 'New']);
});
