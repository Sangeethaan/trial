import './SideBar.css';
import config from './config.js';
import promptPilotLogo from "./assets/promptPilot.png";
import { useContext, useEffect } from 'react';
import { MyContext } from './MyContext';
import { useAuth } from './AuthContext';
import {v1 as uuidv1} from "uuid";


function SideBar() {
    let {allThreads, setAllThreads , currThreadId , setNewChat , setPrompt ,setReply, setCurrThreadId , setPrevChats} = useContext(MyContext);
    const { user, logout, token } = useAuth();

    let getAllThreads = async () => {
        try{
            const response = await fetch(`${config.API_BASE_URL}/api/thread`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const res = await response.json();
                const filteredData = res.map(thread => ({threadId: thread.threadId, title: thread.title}));
                console.log(filteredData);
                setAllThreads(filteredData);
            }
        }catch(err) {
            console.log(err);
        }
    };

    useEffect(() => {
        if (token) {
            getAllThreads();
        }
    }, [currThreadId, token])

    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        setPrevChats([]);
    }

    const changeThread = async (newThreadId) => {
        setCurrThreadId(newThreadId);

        try{
            const response = await fetch(`${config.API_BASE_URL}/api/thread/${newThreadId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const res = await response.json();
                console.log(res);
                setPrevChats(res);
                setNewChat(false);
                setReply(null);
            }
        }catch(err) {
            console.log(err);
        }
    }

    const deleteThread = async (threadId) => {
        try {
            const response = await fetch(`${config.API_BASE_URL}/api/thread/${threadId}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const res = await response.text();
                console.log(res);

                setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));

                if(threadId === currThreadId){
                    createNewChat();
                }
            }
        }catch(err) {
            console.log(err);
        }
    }

    const handleLogout = () => {
        logout();
        createNewChat();
        setAllThreads([]);
    };

    return (
    <section className='sidebar'>
        
        <button onClick={createNewChat}>
            <img src={promptPilotLogo} alt="PromptPilot logo" className='logo'/>
            <i className="fa-solid fa-pen-to-square fa-lg"></i>
        </button>
        
        <ul className='history'>
            {
                allThreads.map((thread, idx) => (
                    <li key={idx} 
                        onClick={(e) => changeThread(thread.threadId)}
                    >{thread.title}
                    <i className ="fa-solid fa-trash"
                    onClick={(e) => {
                        e.stopPropagation();
                        deleteThread(thread.threadId);
                    }}
                    ></i>
                    </li>
                    
                ))
                
            }
        </ul>
        
        <div className="user-info">
            <div className="user-details">
                <div className="user-avatar">
                    <i className="fa-solid fa-user"></i>
                </div>
                <div className="user-name">
                    <span>{user?.username}</span>
                    <small>{user?.email}</small>
                </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
                <i className="fa-solid fa-sign-out-alt"></i>
            </button>
        </div>

    </section>
    )
}

export default SideBar;