import React from 'react';

function Footer() {
    // (CSS Styles)
    const footerStyle = {
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        height: '90px',
        padding: '14px 20px',
        fontSize: '13px',
        textAlign: 'center',
        color: '#aaaaaa',
        borderTop: '1px solid #f5f5f5',
        backgroundColor: '#fafafa',
        boxSizing: 'border-box',
        zIndex: 90
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
            <p>
                &copy; {new Date().getFullYear()} Health Queue Project.
                <br />
                Created as a demonstration project.
            </p>
        </footer>
    );
}

export default Footer;