import { useState } from 'react';

function SignIn({ session, setSession }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('');
        setLoading(true);
        try {
            const response = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), password })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Could not sign in. Please try again.');
            }
            if (typeof data.token !== 'string' || !data.token || !data.user?.name) {
                throw new Error('The server returned an invalid sign-in response.');
            }
            setSession({ token: data.token, user: data.user });
            setPassword('');
        } catch (error) {
            setMessage(error instanceof TypeError
                ? 'Could not reach the server. Check that the backend is running.'
                : error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        setLoading(true);
        setMessage('');
        try {
            const response = await fetch('/api/auth/signout', {
                method: 'POST',
                headers: { Authorization: `Bearer ${session.token}` }
            });
            if (!response.ok) {
                throw new Error('The server could not confirm sign-out. You have been signed out locally.');
            }
        } catch {
            setMessage('The server could not confirm sign-out. You have been signed out locally.');
        } finally {
            setSession(null);
            setLoading(false);
        }
    };

    return (
        <div className="signin-container">
            <h1 className="page-title">{session ? 'Your Account' : 'Sign In'}</h1>
            {session ? (
                <div className="contact-form">
                    <p>Signed in as {session.user.name}.</p>
                    <button className="submit-btn" type="button" onClick={handleSignOut} disabled={loading}>
                        {loading ? 'Signing out...' : 'Sign Out'}
                    </button>
                </div>
            ) : (
                <form className="contact-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="signin-email">Email</label>
                        <input id="signin-email" type="email" autoComplete="email" required
                            value={email} onChange={(event) => setEmail(event.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="signin-password">Password</label>
                        <input id="signin-password" type="password" autoComplete="current-password" required
                            value={password} onChange={(event) => setPassword(event.target.value)} />
                    </div>
                    {message && <p className="signin-message" role="alert">{message}</p>}
                    <button className="submit-btn" type="submit" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            )}
        </div>
    );
}

export default SignIn;
