import './Chat.css';
import { MyContext } from './MyContext';
import { useContext, useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

function Chat() {
    let { newChat, prevChats, reply } = useContext(MyContext);
    const [latestReply, setLatestReply] = useState(null);
    const [lastProcessedReply, setLastProcessedReply] = useState(null);
    const chatEndRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [prevChats, latestReply]);

    useEffect(() => {
        // If reply is null, clear the typing animation
        if (reply === null) {
            setLatestReply(null);
            setLastProcessedReply(null);
            return;
        }

        // If we don't have any previous chats, don't process the reply
        if (!prevChats?.length) return;

        // Check if the last message in prevChats is an assistant message with the same content as reply
        const lastMessage = prevChats[prevChats.length - 1];
        if (lastMessage?.role === "assistant" && lastMessage?.content === reply) {
            // This reply has already been added to prevChats, don't animate
            setLatestReply(null);
            setLastProcessedReply(reply);
            return;
        }

        // Check if we've already processed this exact reply to prevent re-animation
        if (reply === lastProcessedReply) {
            return;
        }

        // Start the typing animation for new replies
        setLastProcessedReply(reply);
        const content = reply.split(" "); // individual words

        let idx = 0;
        const interval = setInterval(() => {
            setLatestReply(content.slice(0, idx + 1).join(" "));
            idx++;
            if (idx >= content.length) {
                clearInterval(interval);
            }
        }, 40);

        return () => clearInterval(interval);
    }, [prevChats, reply, lastProcessedReply]);

    return (
        <div className="chats">
            {newChat && (
                <div className="welcome-section">
                    <h1>How can I help you today?</h1>
                </div>
            )}
            
            {/* Render previous messages */}
            {prevChats?.map((chat, idx) => {
                // Skip the last assistant message if we're currently typing it
                if (chat.role === "assistant" && 
                    idx === prevChats.length - 1 && 
                    chat.content === reply && 
                    latestReply !== null) {
                    return null;
                }
                
                return (
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
                );
            })}

            {/* Render typing animation for latest reply */}
            {latestReply !== null && latestReply !== "" && (
                <div className="gptDiv" key="typing">
                    <div>
                        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                            {latestReply}
                        </ReactMarkdown>
                    </div>
                </div>
            )}
            
            <div ref={chatEndRef} />
        </div>
    );
}

export default Chat;