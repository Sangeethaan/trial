import { useState, useContext } from 'react';
import { useAuth } from './AuthContext';
import { MyContext } from './MyContext';
import './Auth.css';

function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login, register } = useAuth();
    const { setShowAuth, setGuestMode } = useContext(MyContext);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(''); // Clear error when user starts typing
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let result;
            if (isLogin) {
                result = await login(formData.email, formData.password);
            } else {
                result = await register(formData.username, formData.email, formData.password);
            }

            if (result.success) {
                setShowAuth(false);
                setGuestMode(false);
            } else {
                setError(result.error);
            }
        } catch (error) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setFormData({
            username: '',
            email: '',
            password: ''
        });
        setError('');
    };

    const handleBackToGuest = () => {
        setShowAuth(false);
        setGuestMode(true);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <button className="back-to-guest-btn" onClick={handleBackToGuest} style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '1rem',
                    padding: '8px 0',
                    fontSize: '14px',
                    transition: 'color 0.3s ease'
                }}>
                    <i className="fa-solid fa-arrow-left"></i>
                    Continue as Guest
                </button>

                <div className="auth-header">
                    <h2>{isLogin ? 'Sign In' : 'Sign Up'}</h2>
                    <p>Welcome to PromptPilot</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {!isLogin && (
                        <div className="form-group">
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                                required={!isLogin}
                                disabled={loading}
                            />
                        </div>
                    )}
                    
                    <div className="form-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>
                    
                    <div className="form-group">
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button 
                        type="submit" 
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>

                <div className="auth-toggle">
                    <p>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button 
                            type="button" 
                            onClick={toggleMode}
                            className="toggle-button"
                            disabled={loading}
                        >
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Auth;