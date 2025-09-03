import './Chat.css';
import { MyContext } from './MyContext';
import { useContext, useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

function Chat() {
    let { newChat, prevChats, reply } = useContext(MyContext);
    const [latestReply, setLatestReply] = useState(null);
    const chatEndRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [prevChats, latestReply]);

    useEffect(() => {
        if (reply === null) {
            setLatestReply(null);
            return;
        }

        if (!prevChats?.length) return;

        const content = reply.split(" "); // individual words

        let idx = 0;
        const interval = setInterval(() => {
            setLatestReply(content.slice(0, idx + 1).join(" "));
            idx++;
            if (idx >= content.length) clearInterval(interval);
        }, 40);

        return () => clearInterval(interval);
    }, [prevChats, reply]);

    return (
        <div className="chats">
            {newChat && (
                <div className="welcome-section">
                    <h1>How can I help you today?</h1>
                </div>
            )}
            
            {/* Render previous messages */}
            {prevChats?.slice(0, -1).map((chat, idx) => (
                <div className={chat.role === "user" ? "userDiv" : "gptDiv"} key={idx}>
                    {chat.role === "user" ? (
                        <div className="userMessage">{chat.content}</div>
                    ) : (
                        <div>
                            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                                {chat.content}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>
            ))}

            {/* Render typing animation for latest reply */}
            {prevChats.length > 0 && latestReply !== null && (
                <div className="gptDiv" key="typing">
                    <div>
                        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                            {latestReply}
                        </ReactMarkdown>
                    </div>
                </div>
            )}

            {/* Render final reply without typing animation */}
            {prevChats.length > 0 && latestReply === null && prevChats[prevChats.length - 1]?.role === "assistant" && (
                <div className="gptDiv" key="final">
                    <div>
                        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                            {prevChats[prevChats.length - 1].content}
                        </ReactMarkdown>
                    </div>
                </div>
            )}
            
            {/* Auto-scroll anchor */}
            <div ref={chatEndRef} />
        </div>
    );
}

export default Chat;