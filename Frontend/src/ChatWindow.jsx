import './ChatWindow.css';
import Chat from './Chat';
import { MyContext } from './MyContext';
import { useAuth } from './AuthContext';
import { useContext, useState, useEffect } from 'react';
import { ScaleLoader } from "react-spinners";

function ChatWindow() {
    let { prompt, setPrompt, reply, setReply, currThreadId, prevChats, setPrevChats, setNewChat } = useContext(MyContext);
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

    return (
        <div className='chatWindow'>
            <div className="navbar">
                <span>PromptPilot <i className="fa-solid fa-chevron-down fa-xs"></i></span>
                <div className="profile-dropdown-container">
                    <div 
                        className="userIconDiv" 
                        onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    >
                        <div className="userIcon">
                            <span><i className="fa-solid fa-user"></i></span>
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
                            
                            <div className="dropdown-divider"></div>
                            
                            <div 
                                className="dropdown-item theme-item" 
                                onClick={handleThemeToggle}
                            >
                                <i className={`fa-solid fa-${theme === 'dark' ? 'sun' : 'moon'}`}></i>
                                <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'} Theme</span>
                            </div>
                            
                            <div className="dropdown-divider"></div>
                            
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
            </div>

            <Chat></Chat>
            <ScaleLoader color='white' loading={loader} />

            <div className="chatInput">
                <div className="inputBox">
                    <input 
                        type="text"
                        placeholder='Ask Anything'
                        value={prompt}
                        onChange={(e) => { setPrompt(e.target.value); }}
                        onKeyDown={(e) => e.key === 'Enter' ? getReply() : ''}
                        disabled={loader}
                    />
                    <div id="submit" onClick={getReply}>
                        <i className="fa-solid fa-paper-plane"></i>
                    </div>
                </div>

                <p className='info'>
                    PromptPilot can make mistakes. Check important info. See Cookie Preferences.
                </p>
            </div>
        </div>
    )
}

export default ChatWindow;