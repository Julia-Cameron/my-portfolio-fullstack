import { useEffect, useState } from 'react';
import EducationForm from './EducationForm';
import { sortEducation } from './educationOrder';

const originalEducation = [
    {
        sourceKey: 'original-education-1',
        title: 'Software Engineering Technology (Co-op)\n(Advanced Diploma)',
        studyPeriod: 'January 2026 - present',
        isOngoing: true,
        institution: 'Centennial College',
        academicStanding: 'GPA: 4.3/4.5',
        relevantCourses: 'Database Concepts (SQL), Java Programming, Web Interface Design, Software Requirements, Software System Design, Client-Side Web Development, C# Programming, and Python Programming.',
        extracurricularActivities: 'Mastered the art of translating cryptic compiler error messages into plain English and successfully caffeinating my way through back-to-back finals without breaking production code.',
        link: 'https://www.centennialcollege.ca'
    },
    {
        sourceKey: 'original-education-2',
        title: 'Oil and Gas Field Development Master\'s',
        studyPeriod: '2001 - 2006',
        institution: 'Kuban State Technological University',
        academicStanding: 'Summa Cum Laude equivalent\n(evaluated by WES and CES)',
        relevantCourses: 'Reservoir Engineering, Production Optimization, Field Development Planning, and Petroleum Economics.',
        extracurricularActivities: 'Proving that transitioning from drafting complex industrial P&IDs to writing clean software architectures is just a natural evolution of making messy systems make sense.',
        link: 'https://kubstu.ru/en'
    }
];

async function fetchQualifications(signal) {
    const response = await fetch('/api/qualifications', { signal });
    if (!response.ok) throw new Error('Could not load education from the server.');
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('The server returned an invalid education list.');
    return data;
}

function safeLink(value) {
    try {
        const url = new URL(value);
        return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
    } catch {
        return null;
    }
}

function Education({ session }) {
    const [education, setEducation] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [owner, setOwner] = useState({ firstname: '', lastname: '', email: '' });
    const [importing, setImporting] = useState(false);
    const [importMessage, setImportMessage] = useState('');
    const [importError, setImportError] = useState('');
    const [editing, setEditing] = useState(null);
    const [formOpen, setFormOpen] = useState(false);
    const [focusRequest, setFocusRequest] = useState(0);
    const [formError, setFormError] = useState('');
    const [actionMessage, setActionMessage] = useState('');
    const [actionError, setActionError] = useState('');
    const [busy, setBusy] = useState(false);
    const isAdmin = session?.user?.role === 'admin';

    useEffect(() => {
        const controller = new AbortController();
        fetchQualifications(controller.signal)
            .then(setEducation)
            .catch(loadError => {
                if (loadError.name !== 'AbortError') {
                    setError(loadError instanceof TypeError
                        ? 'Could not reach the server. Check that the backend is running.'
                        : loadError.message);
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, []);

    const importEducation = async event => {
        event.preventDefault();
        setImportMessage('');
        setImportError('');
        const firstname = owner.firstname.trim();
        const lastname = owner.lastname.trim();
        const email = owner.email.trim();
        if (!firstname || !lastname || !email) {
            setImportError('Please fill in all owner fields.');
            return;
        }
        setImporting(true);
        try {
            const existing = await fetchQualifications();
            const keys = new Set(existing.map(item => item.sourceKey));
            let count = 0;
            for (const item of originalEducation) {
                if (keys.has(item.sourceKey)) continue;
                const response = await fetch('/api/qualifications', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${session.token}`
                    },
                    body: JSON.stringify({ ...item, firstname, lastname, email })
                });
                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || data.message || 'Could not import an education record.');
                }
                count += 1;
            }
            setEducation(await fetchQualifications());
            setError('');
            setImportMessage(count ? `Imported ${count} education record(s).` : 'The original education records have already been imported.');
        } catch (importFailure) {
            setImportError(`${importFailure instanceof TypeError ? 'Could not reach the server.' : importFailure.message} Some records may already have been imported; you can retry.`);
        } finally {
            setImporting(false);
        }
    };

    const saveEducation = async (data, validationError) => {
        if (!data) {
            setFormError(validationError);
            return;
        }
        setBusy(true);
        setFormError('');
        setActionMessage('');
        setActionError('');
        try {
            const response = await fetch(editing ? `/api/qualifications/${editing._id}` : '/api/qualifications', {
                method: editing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || result.message || 'Could not save education.');
            setEducation(current => editing
                ? current.map(item => item._id === editing._id ? result : item)
                : [...current, result]);
            setActionMessage(editing ? 'Education updated.' : 'Education created.');
            setEditing(null);
            setFormOpen(false);
        } catch (saveError) {
            setFormError(saveError instanceof TypeError
                ? 'Could not reach the server. Check that the backend is running.'
                : saveError.message);
        } finally {
            setBusy(false);
        }
    };

    const deleteEducation = async item => {
        if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
        setBusy(true);
        setActionMessage('');
        setActionError('');
        try {
            const response = await fetch(`/api/qualifications/${item._id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${session.token}` }
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || result.message || 'Could not delete education.');
            setEducation(current => current.filter(record => record._id !== item._id));
            if (editing?._id === item._id) {
                setFormOpen(false);
                setEditing(null);
            }
            setActionMessage('Education deleted.');
        } catch (deleteError) {
            setActionError(deleteError instanceof TypeError
                ? 'Could not reach the server. Check that the backend is running.'
                : deleteError.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="education-container">
            <h1 className="page-title">Education & Credentials</h1>
            <p className="page-subtitle">Long before building e-commerce apps and relational databases, I spent years as a Senior Drafting Engineer turning complex technical drawings into reality and training junior teams. Trading blueprints for code gave me a superpower in cross-functional communication, meticulous quality assurance, and stakeholder alignment - all of which ensures I can build software systems and talk to the humans building them.</p>
            {loading && <p role="status">Loading education...</p>}
            {error && <p role="alert">{error}</p>}
            {!loading && !error && education.length === 0 && <p>No education records have been added yet.</p>}
            {isAdmin && (
                <details>
                    <summary>Import original education records (admin only)</summary>
                    <p>Copy your two original education cards to the database. Existing records are not overwritten. Records imported by this tool are skipped on retry; separately created records may still be duplicated.</p>
                    <form className="contact-form" onSubmit={importEducation}>
                        <p>Owner email is publicly available through the qualification API.</p>
                        <div className="form-group">
                            <label htmlFor="education-owner-firstname">First name</label>
                            <input id="education-owner-firstname" required value={owner.firstname} disabled={importing}
                                onChange={event => setOwner({ ...owner, firstname: event.target.value })} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="education-owner-lastname">Last name</label>
                            <input id="education-owner-lastname" required value={owner.lastname} disabled={importing}
                                onChange={event => setOwner({ ...owner, lastname: event.target.value })} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="education-owner-email">Email</label>
                            <input id="education-owner-email" type="email" required value={owner.email} disabled={importing}
                                onChange={event => setOwner({ ...owner, email: event.target.value })} />
                        </div>
                        <button className="submit-btn" type="submit" disabled={importing || busy}>
                            {importing ? 'Importing...' : 'Import original education'}
                        </button>
                        {importMessage && <p role="status">{importMessage}</p>}
                        {importError && <p className="signin-message" role="alert">{importError}</p>}
                    </form>
                </details>
            )}
            {isAdmin && (
                <div className="education-admin">
                    {!formOpen && <button className="submit-btn" type="button" disabled={busy || importing} onClick={() => {
                        setEditing(null);
                        setFormError('');
                        setFormOpen(true);
                    }}>Add Education</button>}
                    {formOpen && <EducationForm key={editing?._id || 'new'} qualification={editing}
                        focusRequest={editing ? focusRequest : 0} onSave={saveEducation}
                        busy={busy || importing} error={formError} onCancel={() => {
                            setEditing(null);
                            setFormOpen(false);
                            setFormError('');
                        }} />}
                    {actionMessage && <p role="status">{actionMessage}</p>}
                    {actionError && <p className="signin-message" role="alert">{actionError}</p>}
                </div>
            )}
            <div className="education-grid">
                {sortEducation(education).map(item => (
                    <div key={item._id} className="education-card">
                        <h2>{item.title}</h2>
                        <p className="education-year">{item.studyPeriod || ''}</p>
                        <h3>{item.institution || ''}</h3>
                        <p className="education-standing">{item.academicStanding || ''}</p>
                        <p className="education-description">{item.relevantCourses || item.description || ''}</p>
                        <p className="education-description">{item.extracurricularActivities || ''}</p>
                        <p>
                            {safeLink(item.link) && (
                                <a href={safeLink(item.link)} className="education-link" target="_blank" rel="noopener noreferrer">
                                    {item.institution ? `Learn more about ${item.institution}` : 'Learn more'}
                                </a>
                            )}
                        </p>
                        {isAdmin && <div className="form-actions education-actions">
                            <button className="clear-btn" type="button" disabled={busy || importing}
                                aria-label={`Edit ${item.title}`} onClick={() => {
                                    setEditing(item);
                                    setFormError('');
                                    setFormOpen(true);
                                    setFocusRequest(current => current + 1);
                                }}>Edit</button>
                            <button className="clear-btn" type="button" disabled={busy || importing}
                                aria-label={`Delete ${item.title}`} onClick={() => deleteEducation(item)}>Delete</button>
                        </div>}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Education;
