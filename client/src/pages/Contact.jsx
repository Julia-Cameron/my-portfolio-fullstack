import { useState } from 'react';
import emailjs from '@emailjs/browser'; // Import EmailJS for sending emails
import ContactAdmin from './ContactAdmin';

function Contact({ session }) {
    // Track the field values and whether a message is sending or sent.
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [contactVersion, setContactVersion] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(Object.entries(formData).map(([key, value]) => [key, value.trim()]));
        if (!data.name || !data.email || !data.message) {
            setError('Please fill in your name, email, and message.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (response.status === 400) {
                const body = await response.json();
                setError(body.message || 'Please check your message.');
                setLoading(false);
                return;
            }
            if (!response.ok) throw new Error('Could not confirm the save.');
        } catch {
            setResult({
                type: 'warning',
                message: 'We could not confirm whether your message was saved, and it was not emailed. To avoid a duplicate, please contact me directly instead of resubmitting.'
            });
            setLoading(false);
            return;
        }
        setContactVersion(version => version + 1);
        try {
            await emailjs.send('service_iodwejf', 'template_k8cuhxv', {
                from_name: data.name,
                from_email: data.email,
                message: data.message
            }, 'PBxW3VP1JHKnogeMH');
            setResult({
                type: 'success',
                message: 'Your message was saved and sent by email. Thank you!'
            });
        } catch {
            setResult({
                type: 'warning',
                message: 'Your message was saved, but the email could not be sent. Please do not resubmit; you can also email me directly.'
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle changes to the form fields
    const handleChange = (e) => {
        const { name, value } = e.target;
        // Update only the field that triggered this change.
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Handle clearing the form fields
    // Clear the form fields by resetting the formData state to its initial values
    const handleClear = () => {
        setFormData({ name: '', email: '', message: '' });
    };

    return (
        <div className="contact-container">
            <h1 className="page-title">Get in Touch!</h1>
            <p className="contact-subtitle">Whether you have a job opportunity, a project collaboration, or just want to debate the best way to center a
                `div`, my inbox is open.</p>
            <div className="direct-channels">
                <h2>Direct Channels</h2>
                <p><strong>Email:</strong> <a href="mailto:juliacameron.net@gmail.com">juliacameron.net@gmail.com</a><br />
                    <strong>Location:</strong> Windsor, ON<br />
                    <strong>GitHub:</strong> <a href="https://github.com/Julia-Cameron" target="_blank" rel="noopener noreferrer">github.com/Julia-Cameron</a></p>
            </div>
            <div className="contact-form-intro">
                <h2>You can also reach me via the contact form below.</h2>
                <p>Messages are stored for the portfolio admin and sent by email.</p>
            </div>
            {result ? (
                <div className={`contact-result contact-result--${result.type}`} role={result.type === 'warning' ? 'alert' : 'status'}>
                    <p>{result.message}</p>
                </div>
            ) : (
                <form className="contact-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-group label" htmlFor="name">Name:</label>
                        <input className="form-group input"
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            required maxLength={120} disabled={loading}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-group label" htmlFor="email">Email:</label>
                        <input className="form-group input"
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            required maxLength={254} disabled={loading}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-group label" htmlFor="message">Message:</label>
                        <textarea className="form-group input"
                            id="message"
                            name="message"
                            value={formData.message}
                            required maxLength={5000} disabled={loading}
                            onChange={handleChange}
                        />
                    </div>
                    {error && <p className="signin-message contact-form-error" role="alert">{error}</p>}
                    <div className="form-actions">
                        <button className="submit-btn" type="submit" disabled={loading}>
                            {loading ? 'Sending...' : 'Submit'}
                        </button>
                        <button className="clear-btn" type="button" onClick={handleClear} disabled={loading}>
                            Clear
                        </button>
                    </div>
                </form>
            )}
            {session?.user?.role === 'admin' && <ContactAdmin key={contactVersion} token={session.token} />}
        </div>
    );
}
export default Contact;