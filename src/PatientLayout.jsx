import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Header from './components/Header';

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
    // (ค่าเริ่มต้น)
    return { title: 'Health Queue', onBack: null };
};

/**
 * ฟังก์ชันสำหรับอัปเดต Badge แจ้งเตือนของคนไข้
 */
function updateNotificationBadge() {
    try {
        // 🔹 [FIX] 🔹 อ่านจาก sessionStorage
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        
        // (หน้านี้เป็นสาธารณะ ถ้าไม่มี currentUser ก็ไม่ต้องทำอะไร)
        if (!currentUser) return; 

        // (อ่าน DB จาก localStorage)
        const notifications = JSON.parse(localStorage.getItem('notifications')) || []; 
        const hasUnread = notifications.some(n => n.patientId === currentUser.id && !n.read);
        
        const badge = document.getElementById('patient-notification-badge');
        if (badge) {
            badge.style.display = hasUnread ? 'block' : 'none';
        }
    } catch (e) {
        console.error("Failed to update notification badge:", e);
    }
}


function PatientLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    
    const headerProps = getHeaderProps(location.pathname);
    const onBackClick = headerProps.onBack ? () => navigate(-1) : null; // (navigate(-1) = ย้อนกลับ)

    /**
     * (ใช้ Effect เพื่ออัปเดต Badge ทุกครั้งที่เปลี่ยนหน้า)
     */
    useEffect(() => {
        updateNotificationBadge();
    }, [location.pathname]); // (ให้ทำงานใหม่ทุกครั้งที่ URL เปลี่ยน)


    return (
        <div 
            id="app-container" 
            style={{ 
                display: 'block', 
                paddingTop: '40px', // (กันที่ให้ Header)
                paddingBottom: '65px' // (กันที่ให้ Navbar)
            }}
        >
            <Header title={headerProps.title} onBack={onBackClick} />
            <Outlet />
            <Navbar />
        </div>
    );
}

export default PatientLayout;