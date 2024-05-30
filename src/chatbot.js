import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  // Load messages from local storage when the component mounts
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages);
      console.log('Loading messages from local storage:', parsedMessages);
      setMessages(parsedMessages);
    }
  }, []);

  // Save messages to local storage whenever they change
  useEffect(() => {
    console.log('Saving messages to local storage:', messages);
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '') return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: newMessages,
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        }
      });

      const botMessage = response.data.choices[0].message;
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages, botMessage];
        console.log('Updated messages after bot response:', updatedMessages);
        return updatedMessages;
      });
    } catch (error) {
      console.error('Error communicating with OpenAI:', error);
    }

    setInput('');
  };

  const handleClear = () => {
    localStorage.removeItem('chatMessages');
    setMessages([]);
  };

    return (
        <div style={{ height: '70vh', overflowY: 'scroll' }}> {/* Set a fixed height for the chat container */}
        <div style={{ height: 'calc(100% - 50px)', overflowY: 'scroll', border: '1px solid black', padding: '10px' }}>
        {messages.length === 0 ? (
            <p>No messages yet.</p>
        ) : (
            messages.map((msg, index) => (
                <div key={index} style={{ textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                <p><strong>{msg.role}:</strong> {msg.content}</p>
                </div>
            ))
        )}
        </div>
        <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' ? handleSend() : null}
        style={{ width: '80%', padding: '10px' }}
        />
        <button onClick={handleSend} style={{ padding: '10px' }}>Send</button>
        <button onClick={handleClear} style={{ padding: '10px', marginLeft: '10px' }}>Clear Chat</button>
        </div>
    );
};

export default Chatbot;
