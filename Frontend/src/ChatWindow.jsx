import './ChatWindow.css';
import Chat from './Chat';
import { MyContext } from './MyContext';
import { useAuth } from './AuthContext';
import { useContext, useState, useEffect } from 'react';
import { ScaleLoader } from "react-spinners";

function ChatWindow() {
    let { prompt, setPrompt, reply, setReply, currThreadId, prevChats, setPrevChats, setNewChat, showAuth, setShowAuth, guestMode, setGuestMode } = useContext(MyContext);
    const { user, token, logout } = useAuth();
    let [loader, setLoader] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    // Apply theme to document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Clear chat data when switching between guest and authenticated modes
    useEffect(() => {
        if (user && guestMode) {
            // User just signed in from guest mode - clear guest chat data
            setPrevChats([]);
            setReply(null);
            setNewChat(true);
            setGuestMode(false);
        }
    }, [user, guestMode, setPrevChats, setReply, setNewChat, setGuestMode]);

    const getReply = async () => {
        if (!prompt.trim()) return;

        setLoader(true);
        setNewChat(false);

        // Add user message to chat immediately for better UX
        const userMessage = { role: "user", content: prompt };
        setPrevChats(prevChats => [...prevChats, userMessage]);
        const currentPrompt = prompt;
        setPrompt(""); // Clear input immediately
        
        // Clear any previous reply after adding user message
        setReply(null);

        try {
            if (!user || guestMode) {
                // Guest mode API call
                const options = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        message: currentPrompt
                    }),
                };

                const response = await fetch("http://localhost:8080/api/guest-chat", options);
                if (response.ok) {
                    const data = await response.json();
                    setReply(data.reply);
                } else {
                    const errorData = await response.json();
                    console.error('Guest chat error:', errorData);
                    setReply("Sorry, I'm having trouble processing your request right now. Please try again later.");
                }
            } else {
                // Authenticated user API call
                const options = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        message: currentPrompt,
                        threadId: currThreadId
                    }),
                };

                const response = await fetch("http://localhost:8080/api/chat", options);
                if (response.ok) {
                    const data = await response.json();
                    console.log(data.reply);
                    setReply(data.reply);
                } else {
                    const errorData = await response.json();
                    console.error('Chat error:', errorData);
                    setReply("Sorry, I'm having trouble processing your request right now. Please try again later.");
                }
            }
        } catch (err) {
            console.error('Network error:', err);
            setReply("Sorry, I'm having trouble connecting. Please check your internet connection and try again.");
        }
        
        setLoader(false);
    };

    // Append assistant reply to prevChats
    useEffect(() => {
        if (reply) {
            setPrevChats(prevChats => [
                ...prevChats, 
                { role: "assistant", content: reply }
            ]);
        }
    }, [reply, setPrevChats]);

    const handleThemeToggle = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    };

    const handleLogout = () => {
        logout();
        setShowProfileDropdown(false);
        setGuestMode(true);
        // Clear chat data on logout
        setPrevChats([]);
        setReply(null);
        setNewChat(true);
    };

    const handleSignIn = () => {
        setShowAuth(true);
        // Don't set guestMode to false here - let it be handled after successful auth
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
        if (e.key === 'Enter' && !e.shiftKey && !loader) {
            e.preventDefault();
            getReply();
        }
    };

    return (
        <div className='chatWindow'>
            {/* Navbar */}
            <div className="navbar">
                <span className="navbar-title">
                    PromptPilot 
                </span>
                
                {user && !guestMode ? (
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
                    {(!user || guestMode) && (
                        <span> <strong><span onClick={handleSignIn} style={{cursor: 'pointer', color: 'var(--accent-color)'}}>Sign in</span></strong> to save your conversations.</span>
                    )}
                </p>
            </div>
        </div>
    );
}

export default ChatWindow;