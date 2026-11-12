import { useEffect, useState } from 'react';
import bluepinImage from '../assets/bluepin-image.png';
import jsekImage from '../assets/jsek-marketplace-image.png';
import industrialPipeSpanToolImage from '../assets/industrial-pipe-span-tool-image.png';
import realestatePortfolioSiteImage from '../assets/realestate-portfolio-site-image.png';
import ProjectForm from './ProjectForm';

const originalProjects = [
        {
            id: 1,
            title: 'BluePin',
            image: bluepinImage,
            role: 'Full Stack Developer',
            description: 'Built a browser-based engineering document review dashboard supporting blueprint uploads, metadata tracking, threaded comment markups, and revision history. Implemented automated PostgreSQL table provisioning, SHA-256 duplicate file hashing, and dual-storage handling for Supabase cloud buckets or local environments',
            behindTheScenes: 'Bridging the gap between heavy industrial drafting standards and modern web apps - because reviewing technical blueprints shouldn\'t feel like an archaeological excavation.',
            tech: ['Node.js', 'Express 5', 'PostgreSQL', 'Supabase Storage', 'Multer', 'HTML', 'CSS', 'JavaScript'],
            link: 'https://bluepin-r9q9.onrender.com'
        },
        {
            id: 2,
            title: 'JSEK Marketplace',
            image: jsekImage,
            role: 'Frontend Developer',
            description: 'Built core buyer flows including landing, authentication, checkout, and receipt generation for a responsive e-commerce demo. Implemented Luhn checksum card validation, live card brand detection, simulated decline scenarios, and persistent cart management using local storage.',
            behindTheScenes: 'Proving that shopping carts can be built without losing your mind - or your customer\'s data.',
            tech: ['HTML', 'CSS', 'JavaScript', 'Git', 'Jira'],
            link: 'https://jsek-marketplace-project.vercel.app/'
        },

        {
            id: 3,
            title: 'Real Estate Portfolio Site',
            image: realestatePortfolioSiteImage, // Add the image import at the top and reference it here
            role: 'Frontend Developer',
            description: 'A modern and responsive real estate portfolio website showcasing properties and professional services. Built with HTML and CSS to provide a clean, professional presentation of real estate listings and agent information.',
            behindTheScenes: 'Where I learned that making luxury property listings look effortlessly chic on every screen size requires significantly more HTML and CSS than actual real estate agents realize.',
            tech: ['HTML5', 'CSS3'],
            link: 'https://realestate-portfolio-site.vercel.app/'

        },
        {
            id: 4,
            title: 'Industrial Pipe Span Tool',
            image: industrialPipeSpanToolImage,
            role: 'Full Stack Developer',
            description: 'Developed an efficient calculation tool for industrial pipe spans leveraging Python, SQLite, and Streamlit. Designed automated logic to process heavy engineering parameters and ensure structural reliability under real-world oil and gas infrastructure standards.',
            behindTheScenes: 'Channeling my past life as an oil and gas drafting engineer to automate complex span calculations, because manually checking pipe deflection charts is a relic of the dark ages we left behind in 2017.',
            tech: ['Python', 'SQLite', 'Streamlit', 'Oil & Gas Standards'],
            link: 'https://industrial-pipe-span-tool.streamlit.app'
        }
];

const originalImages = Object.fromEntries(
    originalProjects.map(project => [String(project.id), project.image])
);

function safeLink(value) {
    try {
        const url = new URL(value);
        return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
    } catch {
        return null;
    }
}

function Projects({ session }) {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [importing, setImporting] = useState(false);
    const [importMessage, setImportMessage] = useState('');
    const [owner, setOwner] = useState({ firstname: '', lastname: '', email: '' });
    const [editing, setEditing] = useState(null);
    const [formOpen, setFormOpen] = useState(false);
    const [focusRequest, setFocusRequest] = useState(0);
    const [formError, setFormError] = useState('');
    const [actionMessage, setActionMessage] = useState('');
    const [busy, setBusy] = useState(false);
    const isAdmin = session?.user?.role === 'admin';

    useEffect(() => {
        const controller = new AbortController();
        async function loadProjects() {
            try {
                const response = await fetch('/api/projects', { signal: controller.signal });
                if (!response.ok) throw new Error('Could not load projects from the server.');
                const data = await response.json();
                if (!Array.isArray(data)) throw new Error('The server returned an invalid project list.');
                setProjects(data);
            } catch (loadError) {
                if (loadError.name !== 'AbortError') {
                    setError(loadError instanceof TypeError
                        ? 'Could not reach the server. Check that the backend is running.'
                        : loadError.message);
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }
        loadProjects();
        return () => controller.abort();
    }, []);

    const importProjects = async (event) => {
        event.preventDefault();
        setImportMessage('');
        const firstname = owner.firstname.trim();
        const lastname = owner.lastname.trim();
        const email = owner.email.trim();
        if (!firstname || !lastname || !email) {
            setImportMessage('Please fill in all owner fields.');
            return;
        }
        setImporting(true);
        try {
            const listResponse = await fetch('/api/projects');
            if (!listResponse.ok) throw new Error('Could not check the existing projects.');
            const current = await listResponse.json();
            if (!Array.isArray(current)) throw new Error('The server returned an invalid project list.');
            const importedKeys = new Set(current.map(project => project.sourceKey));
            let count = 0;
            for (const project of originalProjects) {
                const sourceKey = `original-portfolio-${project.id}`;
                if (importedKeys.has(sourceKey)) continue;
                const response = await fetch('/api/projects', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${session.token}`
                    },
                    body: JSON.stringify({
                        title: project.title, firstname, lastname, email,
                        description: project.description, role: project.role,
                        behindTheScenes: project.behindTheScenes, tech: project.tech,
                        link: project.link, imageKey: String(project.id), sourceKey
                    })
                });
                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || data.message || 'Could not import a project.');
                }
                count += 1;
            }
            const refreshed = await fetch('/api/projects');
            if (!refreshed.ok) throw new Error('Projects were imported, but the list could not be refreshed.');
            const data = await refreshed.json();
            if (!Array.isArray(data)) throw new Error('The server returned an invalid project list.');
            setProjects(data);
            setError('');
            setImportMessage(count ? `Imported ${count} project(s).` : 'The original projects have already been imported.');
        } catch (importError) {
            setImportMessage(`${importError.message} Some projects may already have been imported; you can retry.`);
        } finally {
            setImporting(false);
        }
    };

    const saveProject = async (data, validationError) => {
        if (!data) {
            setFormError(validationError);
            return;
        }
        setBusy(true);
        setFormError('');
        setActionMessage('');
        try {
            const response = await fetch(editing ? `/api/projects/${editing._id}` : '/api/projects', {
                method: editing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.token}`
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || result.message || 'Could not save the project.');
            setProjects(current => editing
                ? current.map(project => project._id === editing._id ? result : project)
                : [...current, result]);
            setFormOpen(false);
            setActionMessage(editing ? 'Project updated.' : 'Project created.');
            setEditing(null);
        } catch (saveError) {
            setFormError(saveError instanceof TypeError
                ? 'Could not reach the server. Check that the backend is running.'
                : saveError.message);
        } finally {
            setBusy(false);
        }
    };

    const deleteProject = async (project) => {
        if (!window.confirm(`Delete "${project.title}"? This cannot be undone.`)) return;
        setBusy(true);
        setActionMessage('');
        try {
            const response = await fetch(`/api/projects/${project._id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${session.token}` }
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || result.message || 'Could not delete the project.');
            setProjects(current => current.filter(item => item._id !== project._id));
            if (editing?._id === project._id) {
                setFormOpen(false);
                setEditing(null);
            }
            setActionMessage('Project deleted.');
        } catch (deleteError) {
            setActionMessage(deleteError instanceof TypeError
                ? 'Could not reach the server. Check that the backend is running.'
                : deleteError.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="projects-container">
            <h1 className="page-title">Featured Projects</h1>
            <p className="page-subtitle">A collection of software engineering projects built with real code, solid architecture, and just enough caffeine to avoid existential dread.</p>
            {loading && <p role="status">Loading projects...</p>}
            {error && <p role="alert">{error}</p>}
            {!loading && !error && projects.length === 0 && <p>No projects have been added yet.</p>}
            {isAdmin && (
                <details>
                    <summary>Import original portfolio projects (admin only)</summary>
                    <p>Copy your four original project cards into the database. Existing database records are not overwritten. Importing again skips cards previously imported with this tool; separately created records may still result in duplicates.</p>
                    <form className="contact-form" onSubmit={importProjects}>
                        <div className="form-group">
                            <label htmlFor="project-owner-firstname">First name</label>
                            <input id="project-owner-firstname" required value={owner.firstname}
                                onChange={event => setOwner({ ...owner, firstname: event.target.value })} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="project-owner-lastname">Last name</label>
                            <input id="project-owner-lastname" required value={owner.lastname}
                                onChange={event => setOwner({ ...owner, lastname: event.target.value })} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="project-owner-email">Email</label>
                            <input id="project-owner-email" type="email" required value={owner.email}
                                onChange={event => setOwner({ ...owner, email: event.target.value })} />
                        </div>
                        <button className="submit-btn" type="submit" disabled={importing}>
                            {importing ? 'Importing...' : 'Import original projects'}
                        </button>
                        {importMessage && <p role="status">{importMessage}</p>}
                    </form>
                </details>
            )}
            {isAdmin && (
                <div className="project-admin">
                    {!formOpen && <button className="submit-btn" type="button" disabled={busy} onClick={() => {
                        setEditing(null);
                        setFormError('');
                        setFormOpen(true);
                    }}>Add Project</button>}
                    {formOpen && <ProjectForm key={editing?._id || 'new'} project={editing}
                        focusRequest={editing ? focusRequest : 0}
                        onSave={saveProject} busy={busy} error={formError} onCancel={() => {
                            setFormOpen(false);
                            setEditing(null);
                            setFormError('');
                        }} />}
                    {actionMessage && <p role="status">{actionMessage}</p>}
                </div>
            )}
            <div className="projects-grid">
                {projects.map(project => (
                    <div key={project._id} className="project-card">

                        {/* Render the project title, image, description, role, outcome, behind the scenes, tech stack, and link. */}

                        <h2 className="project-title">{project.title}</h2>
                        {originalImages[project.imageKey] && (
                            <img src={originalImages[project.imageKey]} alt={project.title} className="project-image" />
                        )}
                        <p className="project-description">{project.description}</p>
                        {project.role && <p className="project-role"><strong>Role:</strong> {project.role}</p>}
                        {project.outcome && <p className="project-outcome"><strong>Outcome:</strong> {project.outcome}</p>}
                        {project.behindTheScenes && <p className="project-behind-the-scenes"><strong>Behind the Scenes:</strong> {project.behindTheScenes}</p>}
                        <div className="project-card-footer">
                            {Array.isArray(project.tech) && project.tech.length > 0 && <p className="project-tech"><span><strong>TechStack:</strong> {project.tech.join(', ')}</span></p>}
                            {safeLink(project.link) && <a className="project-link" href={safeLink(project.link)} target="_blank" rel="noopener noreferrer">View Project</a>}
                            {isAdmin && <div className="form-actions project-actions">
                                <button className="clear-btn" type="button" disabled={busy} aria-label={`Edit ${project.title}`} onClick={() => {
                                    setEditing(project);
                                    setFormError('');
                                    setFormOpen(true);
                                    setFocusRequest(current => current + 1);
                                }}>Edit</button>
                                <button className="clear-btn" type="button" disabled={busy} aria-label={`Delete ${project.title}`}
                                    onClick={() => deleteProject(project)}>Delete</button>
                            </div>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
export default Projects;    