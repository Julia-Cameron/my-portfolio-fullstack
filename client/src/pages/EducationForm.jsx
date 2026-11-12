import { useEffect, useRef, useState } from 'react';
import { isOngoingEducation } from './educationOrder';

const fields = [
    { name: 'title', label: 'Title', required: true, multiline: true },
    { name: 'firstname', label: 'Owner first name', required: true },
    { name: 'lastname', label: 'Owner last name', required: true },
    { name: 'email', label: 'Owner email', type: 'email', required: true },
    { name: 'studyPeriod', label: 'Study period' },
    { name: 'institution', label: 'Institution' },
    { name: 'academicStanding', label: 'Academic standing', multiline: true },
    { name: 'relevantCourses', label: 'Relevant courses', multiline: true },
    { name: 'extracurricularActivities', label: 'Activities', multiline: true },
    { name: 'completion', label: 'Completion date', type: 'date' },
    { name: 'description', label: 'Description', multiline: true },
    { name: 'link', label: 'Institution link', type: 'url' }
];

function EducationForm({ qualification, onSave, onCancel, busy, error, focusRequest }) {
    const formRef = useRef(null);
    const titleRef = useRef(null);
    const [values, setValues] = useState(() => Object.fromEntries(fields.map(({ name }) => {
        const value = qualification?.[name] ?? '';
        return [name, name === 'completion' && value ? value.slice(0, 10) : value];
    })));
    const [isOngoing, setIsOngoing] = useState(() => isOngoingEducation(qualification || {}));

    useEffect(() => {
        if (focusRequest > 0) {
            formRef.current?.scrollIntoView({ block: 'start' });
            titleRef.current?.focus({ preventScroll: true });
        }
    }, [focusRequest]);

    const submit = event => {
        event.preventDefault();
        const data = Object.fromEntries(Object.entries(values).map(([name, value]) => [name, value.trim()]));
        if (['title', 'firstname', 'lastname', 'email'].some(name => !data[name])) {
            onSave(null, 'Please fill in the required fields.');
            return;
        }
        if (data.link) {
            try {
                if (!['http:', 'https:'].includes(new URL(data.link).protocol)) throw new Error();
            } catch {
                onSave(null, 'Institution link must use http or https.');
                return;
            }
        }
        data.completion = data.completion || null;
        data.isOngoing = isOngoing;
        onSave(data);
    };

    return (
        <form ref={formRef} className="contact-form" onSubmit={submit}>
            <h2>{qualification ? 'Edit Education' : 'Add Education'}</h2>
            <p>Owner email is publicly available through the qualification API.</p>
            <p>For ordering, enter a completion date or mark ongoing studies. Records without either appear last unless a legacy study period includes an end year.</p>
            <label className="education-ongoing">
                <input type="checkbox" checked={isOngoing} disabled={busy}
                    onChange={event => {
                        setIsOngoing(event.target.checked);
                        if (event.target.checked) setValues(current => ({ ...current, completion: '' }));
                    }} />
                Currently studying
            </label>
            {fields.map(({ name, label, type, multiline, required }) => (
                <div className="form-group" key={name}>
                    <label htmlFor={`education-${name}`}>{label}{required ? ' (required)' : ''}</label>
                    {multiline ? (
                        <textarea ref={name === 'title' ? titleRef : undefined} id={`education-${name}`}
                            required={required} value={values[name]} disabled={busy}
                            onChange={event => setValues({ ...values, [name]: event.target.value })} />
                    ) : (
                        <input id={`education-${name}`} type={type || 'text'} required={required}
                            value={values[name]} disabled={busy || (name === 'completion' && isOngoing)}
                            onChange={event => setValues({ ...values, [name]: event.target.value })} />
                    )}
                </div>
            ))}
            {error && <p className="signin-message" role="alert">{error}</p>}
            <div className="form-actions">
                <button className="submit-btn" type="submit" disabled={busy}>{busy ? 'Saving...' : 'Save Education'}</button>
                <button className="clear-btn" type="button" onClick={onCancel} disabled={busy}>Cancel</button>
            </div>
        </form>
    );
}

export default EducationForm;
