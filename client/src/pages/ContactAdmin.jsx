import { useEffect, useState } from 'react';

function ContactAdmin({ token }) {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [editing, setEditing] = useState(null);
    const [values, setValues] = useState({ name: '', email: '', message: '' });

    useEffect(() => {
        const controller = new AbortController();
        fetch('/api/contacts', {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal
        }).then(async response => {
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || data.message || 'Could not load contacts.');
            if (!Array.isArray(data)) throw new Error('The server returned an invalid contact list.');
            setContacts(data);
        }).catch(loadError => {
            if (loadError.name !== 'AbortError') setError(loadError instanceof TypeError
                ? 'Could not reach the server.' : loadError.message);
        }).finally(() => {
            if (!controller.signal.aborted) setLoading(false);
        });
        return () => controller.abort();
    }, [token]);

    const startEditing = contact => {
        setEditing(contact._id);
        setValues({
            name: contact.name || [contact.firstname, contact.lastname].filter(Boolean).join(' '),
            email: contact.email || '',
            message: contact.message || ''
        });
        setError('');
        setNotice('');
    };

    const save = async event => {
        event.preventDefault();
        setBusy(true);
        setError('');
        setNotice('');
        try {
            const response = await fetch(`/api/contacts/${editing}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(values)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || result.message || 'Could not update contact.');
            setContacts(current => current.map(contact => contact._id === editing ? result : contact));
            setEditing(null);
            setNotice('Contact updated.');
        } catch (saveError) {
            setError(saveError instanceof TypeError ? 'Could not reach the server.' : saveError.message);
        } finally {
            setBusy(false);
        }
    };

    const remove = async contact => {
        if (!window.confirm(`Delete the contact from "${contact.name || contact.email}"? This cannot be undone.`)) return;
        setBusy(true);
        setError('');
        setNotice('');
        try {
            const response = await fetch(`/api/contacts/${contact._id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || result.message || 'Could not delete contact.');
            setContacts(current => current.filter(item => item._id !== contact._id));
            if (editing === contact._id) setEditing(null);
            setNotice('Contact deleted.');
        } catch (deleteError) {
            setError(deleteError instanceof TypeError ? 'Could not reach the server.' : deleteError.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <section className="contact-admin" aria-labelledby="saved-contacts-heading">
            <h2 id="saved-contacts-heading">Saved contacts (admin only)</h2>
            {loading && <p role="status">Loading contacts...</p>}
            {error && <p className="signin-message" role="alert">{error}</p>}
            {notice && <p role="status">{notice}</p>}
            {!loading && !error && contacts.length === 0 && <p className="contact-admin-empty">No contacts have been saved yet.</p>}
            {editing && (
                <form className="contact-form" onSubmit={save}>
                    <h3>Edit contact</h3>
                    {['name', 'email', 'message'].map(field => (
                        <div className="form-group" key={field}>
                            <label htmlFor={`edit-contact-${field}`}>{field[0].toUpperCase() + field.slice(1)}</label>
                            {field === 'message'
                                ? <textarea id={`edit-contact-${field}`} required maxLength={5000} value={values[field]} disabled={busy}
                                    onChange={event => setValues({ ...values, [field]: event.target.value })} />
                                : <input id={`edit-contact-${field}`} type={field === 'email' ? 'email' : 'text'} required
                                    maxLength={field === 'email' ? 254 : 120} value={values[field]} disabled={busy}
                                    onChange={event => setValues({ ...values, [field]: event.target.value })} />}
                        </div>
                    ))}
                    <div className="form-actions">
                        <button className="submit-btn" type="submit" disabled={busy}>Save contact</button>
                        <button className="clear-btn" type="button" disabled={busy} onClick={() => setEditing(null)}>Cancel</button>
                    </div>
                </form>
            )}
            <div className="contact-admin-list">
                {contacts.map(contact => (
                    <article className="contact-form" key={contact._id}>
                        <h3>{contact.name || [contact.firstname, contact.lastname].filter(Boolean).join(' ') || 'Unnamed contact'}</h3>
                        <p>{contact.email}</p>
                        <p className="contact-message">{contact.message || 'No message in this older contact record.'}</p>
                        <div className="form-actions">
                            <button className="submit-btn" type="button" disabled={busy}
                                onClick={() => startEditing(contact)}>Edit</button>
                            <button className="clear-btn" type="button" disabled={busy}
                                onClick={() => remove(contact)}>Delete</button>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}

export default ContactAdmin;
