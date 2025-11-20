import React from 'react';
import { NavLink } from 'react-router-dom';

// (SVG Icons)
const AdminHomeIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> );
const ClinicIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h9z"></path><line x1="12" y1="2" x2="12" y2="22"></line></svg> );
const PatientsIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> );
const SettingsIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> );

// 🚀 เพิ่มไอคอน Chat
const ChatIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> );

function NavbarAdmin() {
    // (CSS Styles)
    const navStyle = {
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: '65px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #f0f0f0',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        boxSizing: 'border-box'
    };
    const linkStyle = {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
        color: '#999999',
        fontSize: '11px',
        height: '100%',
    };
    const iconWrapperStyle = {
        position: 'relative',
        marginBottom: '4px'
    };
    const badgeStyle = {
        position: 'absolute',
        top: '-5px',
        right: '-12px',
        minWidth: '18px',
        height: '18px',
        padding: '0 4px',
        backgroundColor: 'var(--primary-color, #007bff)',
        color: 'white',
        borderRadius: '9px',
        fontSize: '10px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
    };
    const appointmentBadgeStyle = {
        ...badgeStyle,
        backgroundColor: 'var(--danger-color, #dc3545)',
        display: 'none', // (ซ่อนไว้ก่อน)
    };
    
    return (
        <>
            {/* (CSS ที่จำเป็นสำหรับ .active) */}
            <style>
            {`
                .admin-nav .nav-link-item.active {
                    color: var(--dark-color, #343a40); 
                    font-weight: 600;
                }
                .admin-nav .nav-link-item.active svg {
                    stroke: var(--dark-color, #343a40);
                }
            `}
            </style>
            
            <nav style={navStyle} className="admin-nav">
                <NavLink to="/admin/home" className="nav-link-item" style={linkStyle}>
                    <div style={iconWrapperStyle}>
                        <AdminHomeIcon />
                        <span id="admin-appointment-badge" style={appointmentBadgeStyle}>0</span>
                    </div>
                    <span>นัดหมาย</span>
                </NavLink>

                <NavLink to="/admin/clinics" className="nav-link-item" style={linkStyle}>
                    <div style={iconWrapperStyle}><ClinicIcon /></div>
                    <span>คลินิก</span>
                </NavLink>
                
                <NavLink to="/admin/appointments" className="nav-link-item" style={linkStyle}>
                    <div style={iconWrapperStyle}>
                        <PatientsIcon />
                        <span id="patient-count-badge" style={badgeStyle}>0</span>
                    </div>
                    <span>คนไข้</span>
                </NavLink>

                {/* 🚀 เพิ่มปุ่มแชทสำหรับแอดมิน */}
                <NavLink to="/admin/chat" className="nav-link-item" style={linkStyle}>
                    <div style={iconWrapperStyle}>
                        <ChatIcon />
                    </div>
                    <span>แชท</span>
                </NavLink>

                <NavLink to="/admin/profile" className="nav-link-item" style={linkStyle}>
                    <div style={iconWrapperStyle}><SettingsIcon /></div>
                    <span>ตั้งค่า</span>
                </NavLink>
            </nav>
        </>
    );
}

export default NavbarAdmin;