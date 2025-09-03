import { useContext } from 'react';
import { MyContext } from './MyContext';
import './About.css';

function About() {
    const { setShowAbout } = useContext(MyContext);

    const handleBack = () => {
        setShowAbout(false);
    };

    return (
        <div className="about-container">
            <div className="about-card">
                <button className="back-button" onClick={handleBack}>
                    <i className="fa-solid fa-arrow-left"></i>
                    Back to Chat
                </button>
                
                <div className="about-content">
                    <div className="about-header">
                        <div className="about-logo">
                            <i className="fa-solid fa-robot"></i>
                        </div>
                        <h1>PromptPilot</h1>
                        <p className="version">Version 1.0.0</p>
                    </div>

                    <div className="about-section">
                        <h2>About PromptPilot</h2>
                        <p>
                            PromptPilot is an AI-powered conversational assistant designed to help you with a wide variety of tasks. 
                            Whether you need help with writing, coding, analysis, creative projects, or just want to have an 
                            engaging conversation, PromptPilot is here to assist you.
                        </p>
                    </div>

                    <div className="about-section">
                        <h2>Key Features</h2>
                        <ul>
                            <li><strong>Intelligent Conversations:</strong> Powered by advanced AI technology</li>
                            <li><strong>Multi-format Support:</strong> Text, code, markdown, and more</li>
                            <li><strong>Thread Management:</strong> Organize your conversations (for signed-in users)</li>
                            <li><strong>Guest Mode:</strong> Use PromptPilot without creating an account</li>
                            <li><strong>Dark/Light Theme:</strong> Customize your visual experience</li>
                            <li><strong>Responsive Design:</strong> Works seamlessly across all devices</li>
                        </ul>
                    </div>

                    <div className="about-section">
                        <h2>How to Use</h2>
                        <ol>
                            <li><strong>Guest Mode:</strong> Start chatting immediately without signing in</li>
                            <li><strong>Sign In:</strong> Create an account to save your conversation history</li>
                            <li><strong>Ask Questions:</strong> Type your questions or requests in the input box</li>
                            <li><strong>Explore Topics:</strong> From coding help to creative writing, PromptPilot can assist with various tasks</li>
                        </ol>
                    </div>

                    <div className="about-section">
                        <h2>Privacy & Data</h2>
                        <p>
                            Your privacy is important to us. Guest mode conversations are not saved or stored. 
                            For signed-in users, conversations are securely stored and only accessible to you. 
                            We do not share your personal data or conversations with third parties.
                        </p>
                    </div>

                    <div className="about-footer">
                        <p>Built with ❤️ for better AI interactions</p>
                        <div className="tech-stack">
                            <span>React</span>
                            <span>Node.js</span>
                            <span>MongoDB</span>
                            <span>Google Gemini AI</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default About;