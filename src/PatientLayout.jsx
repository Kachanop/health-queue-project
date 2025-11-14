import React, { useEffect } from 'react';
// 🔹 [FIX] 1. (ยืนยันว่า import ครบ 4 ตัวนี้)
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
    return { title: 'Health Queue', onBack: null };
};

/**
 * ฟังก์ชันสำหรับอัปเดต Badge แจ้งเตือนของคนไข้
 */
function updateNotificationBadge() {
    try {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        
        // (ถ้าไม่มี user หรือเป็น admin ก็ไม่ต้องโชว์ badge)
        if (!currentUser || currentUser.role === 'admin') return; 

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
    
    // 🔹 [FIX] 2. (อ่าน currentUser ที่นี่เลย)
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

    const headerProps = getHeaderProps(location.pathname);
    const onBackClick = headerProps.onBack ? () => navigate(-1) : null; 

    /**
     * (Effect นี้จะทำงานทุกครั้งที่ URL หรือ สถานะ user เปลี่ยน)
     */
    useEffect(() => {
        
        // 🔹 [FIX] 3. (Logic ป้องกัน Admin) 🔹
        // ถ้าคนที่ล็อกอินอยู่เป็น 'admin'
        if (currentUser && currentUser.role === 'admin') {
            // บังคับเด้งกลับไปที่หน้า Admin ทันที
            navigate('/admin/home', { replace: true });
        }
        // 🔹 [FIX END] 🔹


        // (อัปเดต Badge (Logic นี้ปลอดภัยแล้ว))
        updateNotificationBadge();

    // 🔹 [FIX] 4. (เพิ่ม currentUser เข้าไปใน dependency array)
    }, [location.pathname, navigate, currentUser]);


    // 🔹 [FIX] 5. (ป้องกันการกระพริบ) 🔹
    // ถ้ากำลังจะเด้งกลับ (เพราะเป็น admin) ไม่ต้องแสดงผลหน้าคนไข้
    if (currentUser && currentUser.role === 'admin') {
        return null; // หรือแสดง <p>Redirecting...</p>
    }

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