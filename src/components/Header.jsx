import React from 'react';

/**
 * Header (แถบด้านบน)
 * @param {object} props
 * http://localhost:5173/ - ข้อความที่จะแสดงตรงกลาง
 * @param {function} props.onBack - (Optional) ฟังก์ชันที่จะทำงานเมื่อกดปุ่มย้อนกลับ
 */
function Header({ title, onBack }) {

    // (CSS Styles)
    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 15px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #f0f0f0',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '40px', // (ความสูงของ Header)
        zIndex: 100,
        boxSizing: 'border-box'
    };
    const sectionStyle = { flex: 1 };
    const titleStyle = {
        ...sectionStyle,
        textAlign: 'center',
        fontSize: '17px',
        fontWeight: '600',
        color: '#333'
    };
    const backButtonStyle = {
        background: 'none',
        border: 'none',
        fontSize: '16px',
        color: '#007bff',
        cursor: 'pointer',
        padding: '0 5px'
    };
    
    return (
        // (ลบตัวดันออกแล้ว)
        <header style={headerStyle}>
            <div style={sectionStyle}>
                {onBack && (
                    <button style={backButtonStyle} onClick={onBack}>
                        &larr; กลับ
                    </button>
                )}
            </div>
            <div style={titleStyle}>
                {title}
            </div>
            <div style={sectionStyle} />
        </header>
    );
}

export default Header;