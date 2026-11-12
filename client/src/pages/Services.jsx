import { useEffect, useState } from 'react';

const originalServices = [
    {
        sourceKey: 'original-service-1',
        title: 'Front-End Development',
        description: 'Building responsive, modern, and user-centered web applications using React, JavaScript, HTML, and CSS. Clean component architecture and smooth interfaces are guaranteed.\nIncludes: Meticulous alignment of elements, custom layouts, and a zero-tolerance policy for elements that mysteriously break on mobile screens.'
    },
    {
        sourceKey: 'original-service-2',
        title: 'Full-Stack & Back-End Development',
        description: 'Developing robust back-end application logic, object-oriented systems, and data pipelines using Java, C#, and Python. Connecting user interfaces seamlessly with secure underlying services.\n\nIncludes: Writing clean server-side code, handling APIs like a pro, and managing data flow so your app doesn\'t just look pretty on the surface.'
    },
    {
        sourceKey: 'original-service-3',
        title: 'Database Design & Architecture',
        description: 'Structuring robust relational databases (such as Oracle SQL and SQLite) adhering to Third Normal Form (3NF) standards with optimized business logic queries.\n\nIncludes: Making sure your data stays safe, structured, and far away from accidental DROP TABLE commands.'
    },
    {
        sourceKey: 'original-service-4',
        title: 'Technical Documentation & Engineering Specs',
        description: 'Drafting comprehensive Software Requirements Specifications (SRS), use case diagrams, P&IDs, and technical engineering documentation following strict industry standards.\n\nIncludes: Translating chaotic ideas into beautifully structured documents that even non-technical stakeholders can follow without falling asleep.'
    }
];

const networkMessage = 'Could not reach the server. Check that the backend is running.';

async function fetchServices(signal) {
    const response = await fetch('/api/services', { signal });
    if (!response.ok) throw new Error('Could not load services from the server.');
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('The server returned an invalid services list.');
    return data;
}

function Services({ session }) {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editing, setEditing] = useState(null);
    const [formOpen, setFormOpen] = useState(false);
    const [values, setValues] = useState({ title: '', description: '' });
    const [formError, setFormError] = useState('');
    const [actionMessage, setActionMessage] = useState('');
    const [actionError, setActionError] = useState('');
    const [busy, setBusy] = useState(false);
    const isAdmin = session?.user?.role === 'admin';
    const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.token}` };

    useEffect(() => {
        const controller = new AbortController();
        fetchServices(controller.signal)
            .then(setServices)
            .catch(loadError => {
                if (loadError.name !== 'AbortError') {
                    setError(loadError instanceof TypeError ? networkMessage : loadError.message);
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, []);

    const openForm = service => {
        setEditing(service);
        setValues({ title: service?.title || '', description: service?.description || '' });
        setFormError('');
        setFormOpen(true);
    };

    const closeForm = () => {
        setEditing(null);
        setFormOpen(false);
        setFormError('');
    };

    const saveService = async event => {
        event.preventDefault();
        const data = { title: values.title.trim(), description: values.description.trim() };
        if (!data.title || !data.description) {
            setFormError('Please fill in the title and description.');
            return;
        }
        setBusy(true);
        setFormError('');
        setActionMessage('');
        setActionError('');
        try {
            const response = await fetch(editing ? `/api/services/${editing._id}` : '/api/services', {
                method: editing ? 'PUT' : 'POST',
                headers: authHeaders,
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || result.message || 'Could not save the service.');
            setServices(current => editing
                ? current.map(item => item._id === editing._id ? result : item)
                : [...current, result]);
            setActionMessage(editing ? 'Service updated.' : 'Service created.');
            closeForm();
        } catch (saveError) {
            setFormError(saveError instanceof TypeError ? networkMessage : saveError.message);
        } finally {
            setBusy(false);
        }
    };

    const deleteService = async service => {
        if (!window.confirm(`Delete "${service.title}"? This cannot be undone.`)) return;
        setBusy(true);
        setActionMessage('');
        setActionError('');
        try {
            const response = await fetch(`/api/services/${service._id}`, {
                method: 'DELETE',
                headers: authHeaders
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || result.message || 'Could not delete the service.');
            setServices(current => current.filter(item => item._id !== service._id));
            if (editing?._id === service._id) closeForm();
            setActionMessage('Service deleted.');
        } catch (deleteError) {
            setActionError(deleteError instanceof TypeError ? networkMessage : deleteError.message);
        } finally {
            setBusy(false);
        }
    };

    const importServices = async () => {
        setBusy(true);
        setActionMessage('');
        setActionError('');
        try {
            const keys = new Set((await fetchServices()).map(item => item.sourceKey));
            let count = 0;
            for (const item of originalServices) {
                if (keys.has(item.sourceKey)) continue;
                const response = await fetch('/api/services', {
                    method: 'POST',
                    headers: authHeaders,
                    body: JSON.stringify(item)
                });
                if (!response.ok) {
                    const result = await response.json();
                    throw new Error(result.error || result.message || 'Could not import a service.');
                }
                count += 1;
            }
            setServices(await fetchServices());
            setError('');
            setActionMessage(count ? `Imported ${count} service(s).` : 'The original services have already been imported.');
        } catch (importError) {
            setActionError(`${importError instanceof TypeError ? networkMessage : importError.message} Some services may already have been imported; you can retry.`);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="services-container">
            <h1 className="page-title">Services & Offerings</h1>
            <p className="services-subtitle">Building robust applications without any accidental production database deletions. I bring a strong technical foundation, meticulous attention to detail, and a rigorous approach to software development - ensuring your data stays safe while your product moves forward.</p>
            {loading && <p role="status">Loading services...</p>}
            {error && <p role="alert">{error}</p>}
            {!loading && !error && services.length === 0 && <p>No services have been added yet.</p>}
            {isAdmin && (
                <div className="education-admin">
                    {!formOpen && (
                        <div className="form-actions">
                            <button className="submit-btn" type="button" disabled={busy} onClick={() => openForm(null)}>Add Service</button>
                            {services.length === 0 && !loading && !error && (
                                <button className="clear-btn" type="button" disabled={busy} onClick={importServices}>Import original services</button>
                            )}
                        </div>
                    )}
                    {formOpen && (
                        <form className="contact-form" onSubmit={saveService}>
                            <h2>{editing ? 'Edit Service' : 'Add Service'}</h2>
                            <div className="form-group">
                                <label htmlFor="service-title">Title (required)</label>
                                <input id="service-title" required value={values.title} disabled={busy}
                                    onChange={event => setValues({ ...values, title: event.target.value })} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="service-description">Description (required)</label>
                                <textarea id="service-description" required value={values.description} disabled={busy}
                                    onChange={event => setValues({ ...values, description: event.target.value })} />
                            </div>
                            {formError && <p className="signin-message" role="alert">{formError}</p>}
                            <div className="form-actions">
                                <button className="submit-btn" type="submit" disabled={busy}>{busy ? 'Saving...' : 'Save Service'}</button>
                                <button className="clear-btn" type="button" onClick={closeForm} disabled={busy}>Cancel</button>
                            </div>
                        </form>
                    )}
                    {actionMessage && <p role="status">{actionMessage}</p>}
                    {actionError && <p className="signin-message" role="alert">{actionError}</p>}
                </div>
            )}
            <div className="services-grid">
                {services.map(service => (
                    <div key={service._id} className="service-card">
                        <h2 className="service-title">{service.title}</h2>
                        <div className="service-body">
                            <p className="service-description">{service.description}</p>
                            {isAdmin && (
                                <div className="form-actions education-actions">
                                    <button className="clear-btn" type="button" disabled={busy}
                                        aria-label={`Edit ${service.title}`} onClick={() => openForm(service)}>Edit</button>
                                    <button className="clear-btn" type="button" disabled={busy}
                                        aria-label={`Delete ${service.title}`} onClick={() => deleteService(service)}>Delete</button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Services;
