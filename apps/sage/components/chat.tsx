import React from 'react';

/**
 * Chat component to display user and assistant messages.
 * 
 * @param {Object} props - Component props
 * @param {string} props.userMessage - Message from the user
 * @param {string} props.assistantMessage - Message from the assistant
 */
export default function Chat({ userMessage, assistantMessage }) {
    return (
        <div className="chat-container">
            <div className="message user">
                <div className="message-avatar">🙋</div>
                <div className="message-bubble">{userMessage}</div>
            </div>
            <div className="message assistant">
                <div className="message-avatar">🤖</div>
                <div className="message-bubble">{assistantMessage}</div>
            </div>
        </div>
    );
}
