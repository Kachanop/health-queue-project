import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

// --- SVG Icons ---
const HomeIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>);
const CalendarIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>);
const BellIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>);
const ProfileIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>);
const BackIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>);

/**
 * ฟังก์ชันสำหรับอัปเดต Badge แจ้งเตือน
 */
function updateNotificationBadge() {
    try {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!currentUser || currentUser.role === 'admin') return;

        const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
        // นับเฉพาะของ User คนนี้ และยังไม่ได้อ่าน
        const unreadCount = notifications.filter(n => 
            (n.patientId === currentUser.id || n.patientId === 'all') && !n.read
        ).length;

        const badge = document.getElementById('patient-notification-badge');
        if (badge) {
            if (unreadCount > 0) {
                // ต้องแน่ใจว่า display เป็น flex ก่อนตั้งค่า textContent
                // เพื่อให้การจัดกึ่งกลางทำงานได้ทันที
                badge.style.display = 'flex'; 
                badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
                badge.classList.add('bounce-animation');
            } else {
                badge.style.display = 'none';
            }
        }
    } catch (e) {
        console.error("Failed to update notification badge:", e);
    }
}

/**
 * Header Component (แถบด้านบน)
 */
function Header({ title, logoSrc = '/healthqueue.png', onBack }) {
    const location = useLocation();
    const isPatient = location.pathname.includes('/patient');

    useEffect(() => {
        updateNotificationBadge();
    }, [location.pathname]);

    // --- Inline Styles ---
    const headerHeight = '65px';

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 20px',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)', 
        position: 'fixed', 
        top: 0,
        left: 0,
        right: 0,
        height: headerHeight,
        zIndex: 1000, 
        boxSizing: 'border-box',
        transition: 'all 0.3s ease'
    };

    const logoSectionStyle = {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    };

    const logoImgStyle = {
        height: '100px', // ปรับขนาด Logo ให้เหมาะสมกับ Header 65px
        width: 'auto',
        objectFit: 'contain'
    };

    const titleStyle = {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        textAlign: 'center',
        fontSize: '18px',
        fontWeight: '700',
        color: '#2c3e50',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    };

    const navContainerStyle = {
        flex: 1,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '8px'
    };

    const backButtonStyle = {
        background: 'transparent',
        border: '1px solid #e2e8f0',
        borderRadius: '50%',
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#64748b',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        padding: 0
    };

    return (
        <>
            <style>
                {`
                    .nav-link {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        padding: 8px 12px;
                        border-radius: 12px;
                        text-decoration: none;
                        color: #64748b;
                        font-size: 14px;
                        font-weight: 500;
                        transition: all 0.2s ease-in-out;
                        position: relative;
                    }
                    .nav-link:hover {
                        background-color: #f1f5f9;
                        color: #007bff;
                    }
                    .nav-link.active {
                        background-color: #eff6ff;
                        color: #007bff;
                        font-weight: 600;
                    }
                    
                    .patient-header-notification-badge {
                        position: absolute;
                        top: 2px;
                        right: 10px;
                        background-color: #ff4757;
                        color: white;
                        font-size: 8px;
                        font-weight: bold;
                        min-width: 16px;
                        height: 16px;
                        border-radius: 10px;
                        
                        /* ------------------------------------------- */
                        /* ✨ แก้ไขแล้ว: จัดกึ่งกลางตัวเลขด้วย Flexbox */
                        /* ------------------------------------------- */
                        display: flex;             /* ต้องมี: เปิดใช้งาน Flexbox */
                        justify-content: center;   /* ต้องมี: จัดกึ่งกลางแนวนอน */
                        align-items: center;       /* ต้องมี: จัดกึ่งกลางแนวตั้ง */
                        /* ------------------------------------------- */
                        
                        border: 2px solid #ffffff;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    
                    @media (max-width: 768px) {
                        .nav-text {
                            display: none; /* ซ่อนข้อความ */
                        }
                        .nav-link {
                            padding: 10px;
                            border-radius: 50%;
                            /* ------------------------------------------- */
                            /* 🚀 แก้ไข: จัดกึ่งกลางไอคอนเมื่อข้อความถูกซ่อน */
                            display: flex;             
                            justify-content: center;   
                            align-items: center;       
                            /* ------------------------------------------- */
                        }
                        .patient-header-notification-badge {
                            top: 0;
                            right: 0;
                            /* ไม่ต้องแก้ Flexbox ที่นี่ เพราะกำหนดไว้แล้วในส่วนบน */
                        }
                    }

                    .back-btn:hover {
                        background-color: #f8fafc !important;
                        color: #007bff !important;
                        border-color: #007bff !important;
                    }
                `}
            </style>

            <header style={headerStyle}>
                <div style={logoSectionStyle}>
                    {onBack && (
                        <button 
                            style={backButtonStyle} 
                            onClick={onBack}
                            className="back-btn"
                            title="ย้อนกลับ"
                        >
                            <BackIcon />
                        </button>
                    )}
                    
                    {logoSrc && !onBack && (
                        <img src={logoSrc} alt="Health Queue Logo" style={logoImgStyle} />
                    )}
                </div>

                <div style={titleStyle}>
                    {title}
                </div>

                <div style={navContainerStyle}>
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
                                <div style={{ position: 'relative', display: 'flex' }}>
                                    <BellIcon />
                                    <span id="patient-notification-badge" className="patient-header-notification-badge" style={{display: 'none'}}></span>
                                </div>
                                <span className="nav-text">แจ้งเตือน</span>
                            </NavLink>
                            
                            <NavLink to="/patient/profile" className="nav-link">
                                <ProfileIcon />
                                <span className="nav-text">โปรไฟล์</span>
                            </NavLink>
                        </>
                    )}
                    {!isPatient && <div style={{width: '20px'}}></div>}
                </div>
            </header>
            
            {/* Spacer Block: ดันเนื้อหาลงมาเพื่อให้ Header ไม่บัง */}
            <div style={{ height: headerHeight, width: '100%' }} />
        </>
    );
}

export default Header;