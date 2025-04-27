import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const ChatbotContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
`;

const ChatbotIcon = styled.div`
  width: 50px;
  height: 50px;
  background-color: #007bff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const ChatWindow = styled.div`
  position: absolute;
  bottom: 70px;
  right: 0;
  width: 300px;
  height: 400px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ChatHeader = styled.div`
  background-color: #007bff;
  color: white;
  padding: 10px;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
`;

const ChatBody = styled.div`
  flex: 1;
  padding: 10px;
  overflow-y: auto;
`;

const ChatFooter = styled.div`
  padding: 10px;
  display: flex;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-right: 10px;
`;

const Button = styled.button`
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleIconClick = () => {
    if (!isOpen) {
      setMessages([{ role: 'bot', content: "Hello, welcome to Farmer's Hub! Feel free to ask your doubt." }]);
    }
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSendMessage = async () => {
    if (input.trim()) {
      const userMessage = { role: 'user', content: input };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      try {
        const response = await sendMessageToAPI(updatedMessages);
        const botMessage = {
          role: 'assistant',
          content: response.data.choices[0].message.content.trim(),
        };
        setMessages([...updatedMessages, botMessage]);
      } catch (error) {
        console.error('Error sending message:', error);
      }

      setInput('');
    }
  };

  const sendMessageToAPI = async (messages, retries = 3) => {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo-16k',
          messages: messages,
          max_tokens: 150,
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer sk-proj-SEVvLFicoOVObJMU3IbjT3BlbkFJ1M4GQcUMC5vdEO876QXm`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response;
    } catch (error) {
      if (error.response && error.response.status === 429 && retries > 0) {
        console.warn(`Rate limit exceeded. Retrying in ${2 ** (4 - retries)} seconds...`);
        await new Promise(res => setTimeout(res, 1000 * 2 ** (4 - retries)));
        return sendMessageToAPI(messages, retries - 1);
      }
      if (error.response && error.response.status === 401) {
        console.error('Unauthorized access - please check your API key.');
      }
      throw error;
    }
  };

  return (
    <ChatbotContainer>
      <ChatbotIcon onClick={handleIconClick}>
        <span>💬</span>
      </ChatbotIcon>
      {isOpen && (
        <ChatWindow>
          <ChatHeader>Chatbot</ChatHeader>
          <ChatBody>
            {messages.map((message, index) => (
              <div
                key={index}
                style={{
                  marginBottom: '10px',
                  textAlign: message.role === 'user' ? 'right' : 'left',
                }}
              >
                <div
                  style={{
                    display: 'inline-block',
                    padding: '10px',
                    borderRadius: '10px',
                    backgroundColor: message.role === 'user' ? '#007bff' : '#eee',
                    color: message.role === 'user' ? 'white' : 'black',
                  }}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </ChatBody>
          <ChatFooter>
            <Input value={input} onChange={handleInputChange} />
            <Button onClick={handleSendMessage}>Send</Button>
          </ChatFooter>
        </ChatWindow>
      )}
    </ChatbotContainer>
  );
};

export default Chatbot;
