import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import NavbarAdmin from './components/Navbaradmin';
import Header from './components/Header';

/**
 * (Helper: ตรวจสอบ URL เพื่อกำหนด Title ฝั่ง Admin)
 */
const getAdminHeaderProps = (pathname) => {
    if (pathname.includes('/admin/home')) {
        return { title: 'นัดหมาย (Home)' };
    }
    if (pathname.includes('/admin/clinics')) {
        return { title: 'จัดการคลินิก/แพทย์' };
    }
    if (pathname.includes('/admin/appointments')) {
        return { title: 'จัดการคนไข้' };
    }
    if (pathname.includes('/admin/profile')) {
        return { title: 'ตั้งค่า (Admin)' };
    }
    return { title: 'Admin Dashboard' };
};

function AdminLayout() {
    const location = useLocation();
    const headerProps = getAdminHeaderProps(location.pathname);

    return (
        <div 
            id="admin-app-container" 
            style={{ 
                paddingTop: '40px', // (กันที่ให้ Header)
                paddingBottom: '65px' // (กันที่ให้ Navbar)
            }}
        >
            <Header title={headerProps.title} onBack={null} />
            <Outlet />
            <NavbarAdmin />
        </div>
    );
}

export default AdminLayout;