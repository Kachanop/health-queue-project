import React from 'react';

function Footer() {
    // (CSS Styles)
    const footerStyle = {
        // ลบ position: fixed ออกเพื่อให้ไม่ลอยทับเนื้อหา
        width: '100%',
        height: '90px',
        padding: '14px 20px',
        fontSize: '13px',
        textAlign: 'center',
        color: '#aaaaaa',
        borderTop: '1px solid #f5f5f5',
        backgroundColor: '#fafafa',
        boxSizing: 'border-box',
        zIndex: 90,
        
        // เพิ่ม flex เพื่อจัด content ข้างในให้อยู่กึ่งกลางสวยๆ
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    };

    const logoStyle = {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#bbbbbb',
        marginBottom: '6px'
    };
    
    return (
        <footer style={footerStyle}>
            <div style={logoStyle}>
                Health Queue
            </div>
            <p style={{ margin: 0 }}>
                &copy; {new Date().getFullYear()} Health Queue Project.
                <br />
                Created as a demonstration project.
            </p>
        </footer>
    );
}

export default Footer;