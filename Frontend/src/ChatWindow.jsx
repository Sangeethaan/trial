import './ChatWindow.css';
import Chat from './Chat';
import { MyContext } from './MyContext';
import { useAuth } from './AuthContext';
import { useContext, useState, useEffect } from 'react';
import { ScaleLoader } from "react-spinners";

function ChatWindow() {
    let { prompt, setPrompt, reply, setReply, currThreadId, prevChats, setPrevChats, setNewChat, showAuth, setShowAuth, showAbout, setShowAbout, guestMode, setGuestMode } = useContext(MyContext);
    const { user, token, logout } = useAuth();
    let [loader, setLoader] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    // Apply theme to document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const getReply = async () => {
        if (!prompt.trim()) return;

        setLoader(true);
        setNewChat(false);

        // For guest mode, use guest API endpoint
        if (!user) {
            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: prompt
                }),
            };

            try {
                const response = await fetch("http://localhost:8080/api/guest-chat", options);
                if (response.ok) {
                    const data = await response.json();
                    setReply(data.reply);
                } else {
                    const errorData = await response.json();
                    console.error('Guest chat error:', errorData);
                    setReply("Sorry, I'm having trouble processing your request right now. Please try again later.");
                }
            } catch (err) {
                console.log(err);
                setReply("Sorry, I'm having trouble connecting. Please check your internet connection and try again.");
            }
            setLoader(false);
            return;
        }

        // For authenticated users
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                message: prompt,
                threadId: currThreadId
            }),
        };

        try {
            const response = await fetch("http://localhost:8080/api/chat", options);
            if (response.ok) {
                const data = await response.json();
                console.log(data.reply);
                setReply(data.reply);
            } else {
                const errorData = await response.json();
                console.error('Chat error:', errorData);
            }
        } catch (err) {
            console.log(err);
        }
        setLoader(false);
    };

    // Append new chat to prevChats
    useEffect(() => {
        if (prompt && reply) {
            setPrevChats(prevChats => (
                [...prevChats, {
                    role: "user",
                    content: prompt
                }, {
                    role: "assistant",
                    content: reply
                }]
            ));
        }
        setPrompt("");
    }, [reply]);

    const handleThemeToggle = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    };

    const handleLogout = () => {
        logout();
        setShowProfileDropdown(false);
        setGuestMode(true);
    };

    const handleSignIn = () => {
        setShowAuth(true);
        setGuestMode(false);
    };

    const handleAbout = () => {
        setShowAbout(true);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showProfileDropdown && !event.target.closest('.profile-dropdown-container')) {
                setShowProfileDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showProfileDropdown]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            getReply();
        }
    };

    return (
        <div className='chatWindow'>
            {/* Navbar */}
            <div className="navbar">
                <span className="navbar-title" onClick={handleAbout}>
                    PromptPilot 
                    <i className="fa-solid fa-chevron-down fa-xs"></i>
                </span>
                
                {user ? (
                    <div className="profile-dropdown-container">
                        <div 
                            className="userIconDiv" 
                            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                        >
                            <div className="userIcon">
                                <i className="fa-solid fa-user"></i>
                            </div>
                            <span className="username">{user?.username}</span>
                            <i className={`fa-solid fa-chevron-${showProfileDropdown ? 'up' : 'down'} dropdown-arrow`}></i>
                        </div>
                        
                        {showProfileDropdown && (
                            <div className="profile-dropdown">
                                <div className="dropdown-item email-item">
                                    <i className="fa-solid fa-envelope"></i>
                                    <span>{user?.email}</span>
                                </div>
                                
                                <div 
                                    className="dropdown-item theme-item" 
                                    onClick={handleThemeToggle}
                                >
                                    <i className={`fa-solid fa-${theme === 'dark' ? 'sun' : 'moon'}`}></i>
                                    <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'} Theme</span>
                                </div>
                                
                                <div 
                                    className="dropdown-item logout-item" 
                                    onClick={handleLogout}
                                >
                                    <i className="fa-solid fa-sign-out-alt"></i>
                                    <span>Logout</span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="guest-actions">
                        <button className="theme-toggle-btn" onClick={handleThemeToggle}>
                            <i className={`fa-solid fa-${theme === 'dark' ? 'sun' : 'moon'}`}></i>
                        </button>
                        <button className="sign-in-btn" onClick={handleSignIn}>
                            Sign In
                        </button>
                    </div>
                )}
            </div>

            {/* Main chat content */}
            <div className="chat-content">
                <Chat />
                
                {/* Loading spinner */}
                {loader && (
                    <div className="spinner-container">
                        <ScaleLoader color={theme === 'dark' ? '#339cff' : '#0d6efd'} loading={loader} />
                    </div>
                )}
            </div>

            {/* Chat input */}
            <div className="chatInput">
                <div className="inputBox">
                    <input 
                        type="text"
                        placeholder='Message PromptPilot...'
                        value={prompt}
                        onChange={(e) => { setPrompt(e.target.value); }}
                        onKeyDown={handleKeyDown}
                        disabled={loader}
                    />
                    <div id="submit" onClick={getReply}>
                        <i className="fa-solid fa-paper-plane"></i>
                    </div>
                </div>

                <p className='info'>
                    PromptPilot can make mistakes. Check important info. 
                    {!user && (
                        <span> <strong><span onClick={handleSignIn} style={{cursor: 'pointer', color: 'var(--accent-color)'}}>Sign in</span></strong> to save your conversations.</span>
                    )}
                </p>
            </div>
        </div>
    );
}

export default ChatWindow;