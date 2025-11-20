import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

// --- SVG Icons ---
// ปรับขนาด SVG เป็น 1.25em เพื่อให้สัมพันธ์กับขนาดตัวอักษร
const IconWrapper = ({ children }) => (
    <svg width="1.25em" height="1.25em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {children}
    </svg>
);

const HomeIcon = () => (<IconWrapper><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></IconWrapper>);
const CalendarIcon = () => (<IconWrapper><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></IconWrapper>);
const BellIcon = () => (<IconWrapper><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></IconWrapper>);
const ProfileIcon = () => (<IconWrapper><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></IconWrapper>);
const BackIcon = () => (<IconWrapper><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></IconWrapper>);
const ChatIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>);


function updateNotificationBadge() {
    try {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!currentUser || currentUser.role === 'admin') return;
        const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
        const unreadCount = notifications.filter(n => (n.patientId === currentUser.id || n.patientId === 'all') && !n.read).length;
        const badge = document.getElementById('patient-notification-badge');
        if (badge) {
            if (unreadCount > 0) {
                badge.style.display = 'flex';
                badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
            } else {
                badge.style.display = 'none';
            }
        }
    } catch (e) { console.error(e); }
}

function Header({ title, logoSrc = '/healthqueue.png', onBack }) {
    const location = useLocation();
    const isPatient = location.pathname.includes('/patient');

    useEffect(() => {
        updateNotificationBadge();
    }, [location.pathname]);

    return (
        <>
            <style>
                {`
                    :root {
                        --header-h: 4.5rem;
                        --primary: #007bff;
                    }

                    .modern-header {
                        position: fixed;
                        top: 0; left: 0; right: 0;
                        height: var(--header-h);
                        background: #ffffff;
                        display: flex;
                        align-items: center;
                        justify-content: space-between; /* แยกซ้ายขวาออกจากกัน */
                        padding: 0 3%; /* ระยะห่างจากขอบจอซ้ายขวา */
                        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                        z-index: 1000;
                    }

                    /* --- Logo (Left) --- */
                    .header-left {
                        display: flex;
                        align-items: center;
                        z-index: 2; /* อยู่ชั้นบนเพื่อให้กดได้ */
                    }
                    .header-logo {
                        height: 7rem; /* ปรับความสูงโลโก้ */
                        width: auto;
                    }

                    /* --- Title (Center) --- */
                    .header-title {
                        position: absolute; /* ✨ Key Fix: ลอยอยู่ตรงกลางเสมอ */
                        left: 50%;
                        top: 50%;
                        transform: translate(-50%, -50%);
                        font-size: 1.1rem;
                        font-weight: 700;
                        color: #333;
                        white-space: nowrap;
                        pointer-events: none; /* ไม่ให้บังการคลิก */
                    }

                    /* --- Nav (Right) --- */
                    .header-right {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        z-index: 2;
                    }

                    .nav-link {
                        display: flex;
                        flex-direction: row; /* ✨ Key Fix: บังคับแนวนอน */
                        align-items: center;
                        gap: 8px;
                        padding: 0.6rem 1rem;
                        border-radius: 30px; /* ทรงแคปซูลแบบรูปที่ 2 */
                        text-decoration: none;
                        color: #64748b;
                        font-size: 0.95rem;
                        font-weight: 500;
                        white-space: nowrap; /* ✨ Key Fix: ห้ามตัดบรรทัด */
                        transition: all 0.2s ease;
                    }

                    .nav-link:hover {
                        background-color: #f8fafc;
                        color: var(--primary);
                    }

                    .nav-link.active {
                        background-color: #eff6ff; /* พื้นหลังสีฟ้าอ่อน */
                        color: var(--primary);     /* ตัวหนังสือสีฟ้าเข้ม */
                        font-weight: 600;
                    }

                    /* Notification Badge */
                    .notif-badge {
                        position: absolute;
                        top: 0; right: 0;
                        background: #ef4444;
                        color: white;
                        font-size: 0.6rem;
                        width: 16px; height: 16px;
                        border-radius: 50%;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        border: 2px solid #fff;
                    }

                    /* Back Button */
                    .btn-back {
                        background: none;
                        border: 1px solid #e2e8f0;
                        border-radius: 50%;
                        width: 40px; height: 40px;
                        display: flex; justify-content: center; align-items: center;
                        cursor: pointer;
                        color: #64748b;
                    }
                    .btn-back:hover { background: #f1f5f9; color: var(--primary); }

                    /* Mobile Responsive */
                    @media (max-width: 768px) {
                        .nav-text { display: none; } /* ซ่อน text ในมือถือ */
                        .nav-link { padding: 0.6rem; border-radius: 50%; } /* เปลี่ยนเป็นวงกลม */
                    }
                `}
            </style>

            <header className="modern-header">
                {/* Left Section: Logo or Back Button */}
                <div className="header-left">
                    {onBack ? (
                        <button onClick={onBack} className="btn-back" title="ย้อนกลับ">
                            <BackIcon />
                        </button>
                    ) : (
                        logoSrc && <img src={logoSrc} alt="Logo" className="header-logo" />
                    )}
                </div>

                {/* Center Section: Title */}
                <div className="header-title">
                    {title}
                </div>

                {/* Right Section: Navigation */}
                <div className="header-right">
                    {isPatient && (
                        <>
                            <NavLink to="/patient/home" className="nav-link">
                                <HomeIcon />
                                <span className="nav-text">หน้าหลัก</span>
                            </NavLink>
                            
                            <NavLink to="/patient/appointments" className="nav-link">
                                <CalendarIcon />
                                <span className="nav-text">นัดหมาย</span>
                            </NavLink>
                            
                            <NavLink to="/patient/notifications" className="nav-link">
                                <div style={{position: 'relative', display: 'flex'}}>
                                    <BellIcon />
                                    <span id="patient-notification-badge" className="notif-badge" style={{display:'none'}}></span>
                                </div>
                                <span className="nav-text">แจ้งเตือน</span>
                            </NavLink>
                            
                            {/* เพิ่มปุ่มแชท */}
                            <NavLink to="/patient/chat" className="nav-link">
                                <ChatIcon />
                                <span className="nav-text">แชทสอบถาม</span>
                            </NavLink>

                            <NavLink to="/patient/profile" className="nav-link">
                                <ProfileIcon />
                                <span className="nav-text">โปรไฟล์</span>
                            </NavLink>
                        </>
                    )}
                </div>
            </header>

            {/* Spacer to push content down */}
            <div style={{ height: 'var(--header-h)' }}></div>
        </>
    );
}

export default Header;