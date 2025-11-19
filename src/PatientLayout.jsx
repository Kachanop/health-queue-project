import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header.jsx'; // 👈 แก้ไข: เพิ่ม .jsx
import Footer from './components/Footer.jsx'; // 👈 แก้ไข: เพิ่ม .jsx

/**
 * (Helper: ตรวจสอบ URL เพื่อกำหนด Title และปุ่ม Back)
 */
const getHeaderProps = (pathname) => {
    if (pathname.includes('/patient/home')) {
        return { title: 'หน้าหลัก', onBack: null };
    }
    if (pathname.includes('/patient/clinic-detail')) {
        return { title: 'รายละเอียดคลินิก', onBack: true };
    }
    if (pathname.includes('/patient/appointments')) {
        return { title: 'นัดหมายของฉัน', onBack: null };
    }
    if (pathname.includes('/patient/notifications')) {
        return { title: 'การแจ้งเตือน', onBack: null };
    }
    if (pathname.includes('/patient/profile')) {
        return { title: 'โปรไฟล์', onBack: null };
    }
    return { title: 'Health Queue', onBack: null };
};

/**
 * ฟังก์ชันสำหรับอัปเดต Badge แจ้งเตือนของคนไข้
 * (ใช้ display: flex และแสดงตัวเลข เพื่อให้จัดกึ่งกลางและแสดงผลถูกต้อง)
 */
function updateNotificationBadge() {
    try {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        
        // (ถ้าไม่มี user หรือเป็น admin ก็ไม่ต้องโชว์ badge)
        if (!currentUser || currentUser.role === 'admin') return; 

        const notifications = JSON.parse(localStorage.getItem('notifications')) || []; 
        
        // 🔹 นับจำนวนที่ยังไม่ได้อ่านและรวมแจ้งเตือนส่วนกลาง
        const unreadCount = notifications.filter(n => 
            (n.patientId === currentUser.id || n.patientId === 'all') && !n.read
        ).length;
        
        const badge = document.getElementById('patient-notification-badge');
        if (badge) {
            if (unreadCount > 0) {
                // 🚀 ใช้ 'flex' และกำหนด text content เพื่อให้การจัดกึ่งกลางสมบูรณ์
                badge.style.display = 'flex'; 
                badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
                // เพิ่ม animation หรือคลาสอื่นๆ ได้ที่นี่ ถ้ามี
            } else {
                badge.style.display = 'none';
            }
        }
    } catch (e) {
        console.error("Failed to update notification badge:", e);
    }
}

function PatientLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    
    // ดึง currentUser ออกจาก sessionStorage
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

    const headerProps = getHeaderProps(location.pathname);
    const onBackClick = headerProps.onBack ? () => navigate(-1) : null; 

    /**
     * (Effect นี้จะทำงานทุกครั้งที่ URL หรือ สถานะ user เปลี่ยน)
     */
    useEffect(() => {
        
        // (Logic ป้องกัน Admin)
        if (currentUser && currentUser.role === 'admin') {
            navigate('/admin/home', { replace: true });
        }

        // (อัปเดต Badge)
        updateNotificationBadge();

    }, [location.pathname, navigate, currentUser]);


    // (ป้องกันการกระพริบ)
    if (currentUser && currentUser.role === 'admin') {
        return null; 
    }

    return (
        <div 
            id="app-container" 
            style={{ 
                display: 'block', 
                paddingTop: '72px', // (กันที่ให้ Header)
                paddingBottom: '110px' // (กันที่ให้ Footer)
            }}
        >
            <Header title={headerProps.title} onBack={onBackClick} />
            <Outlet />
            <Footer />
        </div>
    );
}

export default PatientLayout;