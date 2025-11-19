import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

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

<<<<<<< HEAD
=======
/**
 * ฟังก์ชันสำหรับอัปเดต Badge แจ้งเตือนของคนไข้
 */
function updateNotificationBadge() {
    try {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        
        // (ถ้าไม่มี user หรือเป็น admin ก็ไม่ต้องโชว์ badge)
        if (!currentUser || currentUser.role === 'admin') return; 

        const notifications = JSON.parse(localStorage.getItem('notifications')) || []; 
        
        // 🔹 [FIXED] เพิ่มเงื่อนไข n.patientId === 'all' เพื่อให้แจ้งเตือนข่าวสารส่วนกลางด้วย 🔹
        const hasUnread = notifications.some(n => 
            (n.patientId === currentUser.id || n.patientId === 'all') && !n.read
        );
        
        const badge = document.getElementById('patient-notification-badge');
        if (badge) {
            badge.style.display = hasUnread ? 'block' : 'none';
        }
    } catch (e) {
        console.error("Failed to update notification badge:", e);
    }
}

>>>>>>> 0e4b8ddcd87ebfb2a9873fb4dda9d79870129d53

function PatientLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    
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

<<<<<<< HEAD
    // 🔹 [FIX] 4. (เพิ่ม currentUser เข้าไปใน dependency array)
=======
        // (อัปเดต Badge)
        updateNotificationBadge();

>>>>>>> 0e4b8ddcd87ebfb2a9873fb4dda9d79870129d53
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