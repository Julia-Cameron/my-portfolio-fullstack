import { useEffect, useRef, useState } from 'react';

const fields = [
    { name: 'title', label: 'Title', required: true },
    { name: 'firstname', label: 'Owner first name', required: true },
    { name: 'lastname', label: 'Owner last name', required: true },
    { name: 'email', label: 'Owner email', type: 'email', required: true },
    { name: 'completion', label: 'Completion date', type: 'date' },
    { name: 'description', label: 'Description', multiline: true },
    { name: 'role', label: 'Project role' },
    { name: 'outcome', label: 'Outcome', multiline: true },
    { name: 'behindTheScenes', label: 'Behind the scenes', multiline: true },
    { name: 'tech', label: 'Technologies (comma-separated)' },
    { name: 'link', label: 'Project link', type: 'url' }
];

function ProjectForm({ project, onSave, onCancel, busy, error, focusRequest }) {
    const formRef = useRef(null);
    const titleRef = useRef(null);
    const [values, setValues] = useState(() => Object.fromEntries(fields.map(({ name }) => {
        let value = project?.[name] ?? '';
        if (name === 'tech') value = Array.isArray(value) ? value.join(', ') : '';
        if (name === 'completion' && value) value = value.slice(0, 10);
        return [name, value];
    })));

    useEffect(() => {
        if (focusRequest > 0) {
            formRef.current?.scrollIntoView({ block: 'start' });
            titleRef.current?.focus({ preventScroll: true });
        }
    }, [focusRequest]);

    const submit = (event) => {
        event.preventDefault();
        const data = Object.fromEntries(
            Object.entries(values).map(([name, value]) => [name, value.trim()])
        );
        if (['title', 'firstname', 'lastname', 'email'].some(name => !data[name])) {
            onSave(null, 'Please fill in the required fields.');
            return;
        }
        if (data.link) {
            try {
                if (!['http:', 'https:'].includes(new URL(data.link).protocol)) throw new Error();
            } catch {
                onSave(null, 'Project link must use http or https.');
                return;
            }
        }
        data.tech = data.tech.split(',').map(value => value.trim()).filter(Boolean);
        data.completion = data.completion || null;
        onSave(data);
    };

    return (
        <form ref={formRef} className="contact-form" onSubmit={submit}>
            <h2>{project ? 'Edit Project' : 'Add Project'}</h2>
            <p>Owner email is publicly available through the project API.</p>
            {fields.map(({ name, label, type, multiline, required }) => (
                <div className="form-group" key={name}>
                    <label htmlFor={`project-${name}`}>{label}{required ? ' (required)' : ''}</label>
                    {multiline ? (
                        <textarea id={`project-${name}`} value={values[name]} disabled={busy}
                            onChange={event => setValues({ ...values, [name]: event.target.value })} />
                    ) : (
                        <input ref={name === 'title' ? titleRef : undefined} id={`project-${name}`} type={type || 'text'} required={required}
                            value={values[name]} disabled={busy}
                            onChange={event => setValues({ ...values, [name]: event.target.value })} />
                    )}
                </div>
            ))}
            {error && <p className="signin-message" role="alert">{error}</p>}
            <div className="form-actions">
                <button className="submit-btn" type="submit" disabled={busy}>
                    {busy ? 'Saving...' : 'Save Project'}
                </button>
                <button className="clear-btn" type="button" onClick={onCancel} disabled={busy}>Cancel</button>
            </div>
        </form>
    );
}

export default ProjectForm;
