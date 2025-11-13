import React from 'react';

function Footer() {
    // (CSS Styles)
    const footerStyle = {
        padding: '30px 20px',
        marginTop: '40px',
        fontSize: '13px',
        textAlign: 'center',
        color: '#aaaaaa',
        borderTop: '1px solid #f5f5f5',
        backgroundColor: '#fafafa'
    };
    const logoStyle = {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#bbbbbb',
        marginBottom: '10px'
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