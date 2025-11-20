import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// --- SVG Icons ---
const SendIcon = () => ( <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <line x1="22" y1="2" x2="11" y2="13"></line> <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon> </svg> );
const RobotIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#007bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <rect x="3" y="11" width="18" height="10" rx="2"></rect> <circle cx="12" cy="5" r="2"></circle> <path d="M12 7v4"></path> <line x1="8" y1="16" x2="8" y2="16"></line> <line x1="16" y1="16" x2="16" y2="16"></line> </svg> );

export default function Chat() {
  const messagesEndRef = useRef(null);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // ดึงข้อมูล User ปัจจุบัน
  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    if (user) setCurrentUser(user);
  }, []);

  // โหลดข้อความเก่า และคอยเช็คข้อความใหม่ (Polling)
  useEffect(() => {
    if (!currentUser) return;

    const loadMessages = () => {
      const allChats = JSON.parse(localStorage.getItem('chat_sessions')) || {};
      const myChat = allChats[currentUser.id] || { messages: [] };
      
      // ถ้าไม่มีประวัติเลย ให้ใส่ข้อความต้อนรับ
      if (myChat.messages.length === 0) {
        const welcomeMsg = { id: 1, text: 'สวัสดีครับ มีอะไรให้เจ้าหน้าที่ช่วยไหมครับ?', sender: 'admin', timestamp: new Date().toISOString() };
        setMessages([welcomeMsg]);
      } else {
        setMessages(myChat.messages);
      }
    };

    loadMessages(); // โหลดครั้งแรก
    const interval = setInterval(loadMessages, 1000); // เช็คข้อความใหม่ทุก 1 วินาที (จำลอง Real-time)

    return () => clearInterval(interval);
  }, [currentUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (text) => {
    if (!text.trim() || !currentUser) return;

    const newMessage = {
      id: Date.now(),
      text: text,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    // อัปเดต State ทันที
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInputValue('');

    // บันทึกลง LocalStorage (ส่งไปหาแอดมิน)
    const allChats = JSON.parse(localStorage.getItem('chat_sessions')) || {};
    allChats[currentUser.id] = {
      patientId: currentUser.id,
      patientName: currentUser.name || 'Guest User',
      messages: updatedMessages,
      lastUpdated: new Date().toISOString(),
      unread: (allChats[currentUser.id]?.unread || 0) + 1 // เพิ่มจำนวนข้อความที่แอดมินยังไม่อ่าน
    };
    localStorage.setItem('chat_sessions', JSON.stringify(allChats));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSendMessage(inputValue);
  };

  // --- Styles ---
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 180px)', 
    backgroundColor: '#f4f7f6',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    margin: '10px 20px'
  };

  const bubbleStyle = (sender) => ({
    maxWidth: '75%',
    padding: '10px 14px',
    borderRadius: '16px',
    fontSize: '0.9rem',
    lineHeight: '1.5',
    alignSelf: sender === 'user' ? 'flex-end' : 'flex-start',
    backgroundColor: sender === 'user' ? '#007bff' : '#ffffff',
    color: sender === 'user' ? '#ffffff' : '#333333',
    borderBottomRightRadius: sender === 'user' ? '4px' : '16px',
    borderTopLeftRadius: sender !== 'user' ? '4px' : '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    whiteSpace: 'pre-line'
  });

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 1rem', backgroundColor: '#ffffff', borderBottom: '1px solid #e9ecef', gap: '10px' }}>
        <div style={{ width: '36px', height: '36px', background: '#e7f1ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RobotIcon />
        </div>
        <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#333' }}>แชทกับเจ้าหน้าที่</h4>
            <span style={{ fontSize: '0.7rem', color: '#28a745' }}>● ออนไลน์</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ display: 'flex', flexDirection: 'column', alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '100%' }}>
             <div style={bubbleStyle(msg.sender)}>{msg.text}</div>
             <span style={{ fontSize: '0.65rem', color: '#adb5bd', marginTop: '2px', alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
               {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '10px', backgroundColor: '#ffffff', borderTop: '1px solid #e9ecef', display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="สอบถามข้อมูล..."
          style={{ flex: 1, padding: '10px 12px', borderRadius: '20px', border: '1px solid #ced4da', outline: 'none', fontSize: '0.9rem' }}
        />
        <button onClick={() => handleSendMessage(inputValue)} disabled={!inputValue.trim()} style={{ background: inputValue.trim() ? '#007bff' : '#e9ecef', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <SendIcon />
        </button>
      </div>
    </div>
  );
}