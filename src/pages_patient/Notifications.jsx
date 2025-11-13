import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// (CSS ถูก import ใน main.jsx แล้ว)

/**
 * (Helper: คัดลอก Logic การอัปเดต Badge มาจาก PatientLayout
 * เพื่อให้ Badge หายทันทีที่หน้านี้โหลด)
 */
function updateNotificationBadgeOnLoad() {
    try {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!currentUser) return; 

        const badge = document.getElementById('patient-notification-badge');
        if (badge) {
            badge.style.display = 'none'; // (บังคับซ่อนทันที)
        }
    } catch (e) {
        console.error("Failed to update notification badge:", e);
    }
}


function Notifications() {
    // --- State ---
    const [notifications, setNotifications] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    // (เราไม่ต้องการ useNavigate ที่นี่แล้ว เพราะ ProtectedRoute จัดการ)

    // --- Effect (เมื่อคอมโพเนนต์โหลด) ---
    useEffect(() => {
        // (หน้านี้ถูก ProtectedRoute คุ้มครองอยู่แล้ว)
        const user = JSON.parse(sessionStorage.getItem('currentUser'));
        setCurrentUser(user);
        
        let allNotifs = JSON.parse(localStorage.getItem('notifications')) || [];
        
        // (Logic จาก app.js: Mark as read)
        let markedAsRead = false;
        allNotifs.forEach(n => {
            if (n.patientId === user.id && !n.read) {
                n.read = true;
                markedAsRead = true;
            }
        });
        
        // (ถ้ามีการเปลี่ยนแปลง ให้บันทึก)
        if (markedAsRead) {
            localStorage.setItem('notifications', JSON.stringify(allNotifs));
            // (อัปเดต Badge ใน Navbar ทันที)
            updateNotificationBadgeOnLoad();
        }

        setNotifications(allNotifs);

    }, []); // (ทำงานแค่ครั้งเดียว)

    // --- Memoized Data (กรองข้อมูล) ---
    const myNotifications = useMemo(() => {
        if (!currentUser) return [];
        return notifications
            .filter(n => n.patientId === currentUser.id)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // (เรียงล่าสุดอยู่บน)
    }, [notifications, currentUser]);
    
    // --- Handlers ---
    const renderNotificationCard = (n) => {
        const icon = n.type === 'confirmed' ? '✅' : '❌';
        const cardClass = n.type === 'confirmed' ? 'status-confirmed' : 'status-rejected';
        
        return (
            <div key={n.id} className={`card appointment-card ${cardClass} read`}>
                <div className="notification-item">
                    <p><strong>{icon} {n.type === 'confirmed' ? 'ยืนยันนัดหมาย' : 'ปฏิเสธนัดหมาย'}</strong></p>
                    <p>{n.message}</p>
                    <small>{new Date(n.timestamp).toLocaleString('th-TH')}</small>
                </div>
            </div>
        );
    };

    // --- Render ---
    return (
        // (Layout จะใส่ Header ให้)
        <div id="page-notifications" className="page active">
            <main className="container" id="notifications-list">
                
                {myNotifications.length === 0 ? (
                    <p className="text-center">คุณยังไม่มีการแจ้งเตือน</p>
                ) : (
                    <>
                        {/* (เราจะแสดงประวัติทั้งหมดเลย เพราะมันถูก Mark as read ไปแล้ว) */}
                        <h3 className="notification-header">ประวัติการแจ้งเตือน</h3>
                        {myNotifications.map(renderNotificationCard)}
                    </>
                )}
                
            </main>
        </div>
    );
}

export default Notifications;