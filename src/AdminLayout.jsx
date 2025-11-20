import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import NavbarAdmin from './components/Navbaradmin.jsx';
import Header from './components/Header.jsx';

const getAdminHeaderProps = (pathname) => {
    if (pathname.includes('/admin/home')) return { title: 'นัดหมาย (Home)' };
    if (pathname.includes('/admin/clinics')) return { title: 'จัดการคลินิก/แพทย์' };
    if (pathname.includes('/admin/appointments')) return { title: 'จัดการคนไข้' };
    if (pathname.includes('/chat/chat')) return { title: 'แชทกับคนไข้' };
    if (pathname.includes('/admin/profile')) return { title: 'ตั้งค่า (Admin)' };
    return { title: 'Admin Dashboard' };
};

function AdminLayout() {
    const location = useLocation();
    const headerProps = getAdminHeaderProps(location.pathname);

    return (
        <div 
            id="admin-app-container" 
            style={{ 
                display: 'block',
                paddingTop: '72px', 
                paddingBottom: '80px',
                minHeight: '100vh',
                boxSizing: 'border-box'
            }}
        >
            <Header title={headerProps.title} onBack={null} />
            <Outlet />
            <NavbarAdmin />
        </div>
    );
}

export default AdminLayout;