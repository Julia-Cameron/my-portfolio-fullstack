import { useState } from 'react';
import { Link } from 'react-router-dom';

function SignUp({ session }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [created, setCreated] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('');
        if (!name.trim()) {
            setMessage('Please enter your name.');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), email: email.trim(), password })
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Could not create your account.');
            }
            setPassword('');
            setCreated(true);
        } catch (error) {
            setMessage(error instanceof TypeError
                ? 'Could not reach the server. Check that the backend is running.'
                : error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signin-container">
            <h1 className="page-title">Sign Up</h1>
            {session ? (
                <p>You are already signed in. <Link to="/signin">View your account</Link>.</p>
            ) : created ? (
                <div className="contact-form">
                    <p role="status">Account created successfully. You can now sign in.</p>
                    <Link to="/signin">Go to Sign In</Link>
                </div>
            ) : (
                <form className="contact-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="signup-name">Name</label>
                        <input id="signup-name" type="text" autoComplete="name" required
                            value={name} onChange={(event) => setName(event.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="signup-email">Email</label>
                        <input id="signup-email" type="email" autoComplete="email" required
                            value={email} onChange={(event) => setEmail(event.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="signup-password">Password</label>
                        <input id="signup-password" type="password" autoComplete="new-password" required
                            value={password} onChange={(event) => setPassword(event.target.value)} />
                    </div>
                    {message && <p className="signin-message" role="alert">{message}</p>}
                    <button className="submit-btn" type="submit" disabled={loading}>
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </button>
                    <p>Already have an account? <Link to="/signin">Sign In</Link></p>
                </form>
            )}
        </div>
    );
}

export default SignUp;
