import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Style สำหรับจัดกลางหน้าจอ (Full Screen Centered)
const authPageStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',    
  justifyContent: 'center', 
  padding: '1rem',
  boxSizing: 'border-box',
  backgroundColor: '#f4f7f6' 
};

function Login() {
    // --- State ---
    const [view, setView] = useState('login'); // 'login' or 'register'
    const navigate = useNavigate();
    const location = useLocation();
    
    // Logic การจำหน้า 'from'
    const fromPath = location.state?.from?.pathname; 
    let fromPatient = "/patient/home";
    let fromAdmin = "/admin/home";

    if (fromPath && fromPath.startsWith('/admin')) {
        fromAdmin = fromPath;
    } else if (fromPath && fromPath.startsWith('/patient')) {
        fromPatient = fromPath;
    }

    // State สำหรับฟอร์ม Login
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // State สำหรับฟอร์ม Register
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regIdCard, setRegIdCard] = useState('');

    // --- 1. Login Handler ---
    const handleLogin = (e) => {
        e.preventDefault();
        
        const email = loginEmail.trim();

        // 1. ตรวจสอบ Admin (Mock)
        if (email.endsWith('@admin.com')) {
            // เช็คพาสเวิร์ดแอดมินแบบง่ายๆ (ถ้าต้องการ) หรือปล่อยผ่าน
            const mockAdmin = { 
                name: email.split('@')[0], 
                email: email, 
                role: 'admin',
                id: 'admin_' + Date.now()
            };
            sessionStorage.setItem('currentUser', JSON.stringify(mockAdmin)); 
            navigate(fromAdmin, { replace: true });

        } else {
            // --- 2. เข้าสู่ระบบ (คนไข้) ---
            
            // ดึงข้อมูล users ทั้งหมดจาก LocalStorage
            const users = JSON.parse(localStorage.getItem('users')) || []; 
            
            // ค้นหา user ที่อีเมลตรงกัน
            const user = users.find(u => u.email === email);
            
            if (!user) {
                // ❌ กรณีไม่พบ User: แจ้งเตือนและไม่ให้เข้า
                alert("ไม่พบบัญชีผู้ใช้งานนี้ กรุณาสมัครสมาชิกก่อนเข้าใช้งาน");
                return; 
            }

            // ✅ กรณีพบ User: ตรวจสอบรหัสผ่าน
            if (user.password !== loginPassword) {
                alert("รหัสผ่านไม่ถูกต้อง");
                return;
            }
            
            // ผ่านการตรวจสอบ -> บันทึก Session และเปลี่ยนหน้า
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            navigate(fromPatient, { replace: true });
        }
    };

    // --- 2. Register Handler ---
    const handleRegister = (e) => {
        e.preventDefault();
        
        const users = JSON.parse(localStorage.getItem('users')) || []; 
        
        // ตรวจสอบว่าอีเมลซ้ำหรือไม่
        if (users.find(u => u.email === regEmail)) {
            alert("อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น หรือเข้าสู่ระบบ");
            return;
        }
        
        const newUser = { 
            id: Date.now(), 
            name: regName, 
            email: regEmail, 
            password: regPassword, 
            idCard: regIdCard,
            healthProfile: {}
        };
        
        // บันทึกลง LocalStorage
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users)); 
        
        alert("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
        
        // เคลียร์ค่าและกลับไปหน้า Login
        setRegName('');
        setRegEmail('');
        setRegPassword('');
        setRegIdCard('');
        setView('login');
    };

    // --- Render ---
    return (
        <div id="auth-container" style={authPageStyle}>

            {/* 1a. หน้า Login */}
            <div 
                id="page-login" 
                style={{ display: view === 'login' ? 'block' : 'none', width: '100%', maxWidth: '450px' }}
            >
                <div className="container" style={{padding: 0}}>
                    <div className="card">
                        <h2>เข้าสู่ระบบ</h2>
                        <p style={{fontSize: '0.9rem', color: '#666'}}>
                            โปรดเข้าสู่ระบบด้วยบัญชีที่คุณได้เคยสมัครไว้บนเว็บไซต์รายละเอียด
                        </p>
                        <form id="login-form" onSubmit={handleLogin}>
                            <div className="input-group">
                                <label htmlFor="email">อีเมล</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    className="input" 
                                    required 
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    placeholder="user@gmail.com"
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="password">รหัสผ่าน</label>
                                <input 
                                    type="password" 
                                    id="password" 
                                    className="input" 
                                    required 
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    placeholder="กรอกรหัสผ่าน"
                                />
                            </div>
                            <button type="submit" className="btn">เข้าสู่ระบบ</button>
                        </form>
                        <p className="text-center" style={{marginTop: '1.5rem', marginBottom: 0}}>
                            ยังไม่มีบัญชี? 
                            <a 
                                href="#" 
                                className="auth-link" 
                                onClick={(e) => { e.preventDefault(); setView('register'); }}
                                style={{marginLeft: '5px'}}
                            >
                                สมัครสมาชิกที่นี่
                            </a>
                        </p>
                    </div>
                </div>
            </div>
            
            {/* 1b. หน้า Register */}
            <div 
                id="page-register" 
                style={{ display: view === 'register' ? 'block' : 'none', width: '100%', maxWidth: '450px' }}
            >
                <div className="container" style={{padding: 0}}>
                    <div className="card">
                        <h2>สมัครสมาชิก</h2>
                        <p>สร้างบัญชีใหม่เพื่อเริ่มใช้งาน Health Queue</p>
                        <form id="register-form" onSubmit={handleRegister}>
                            <div className="input-group">
                                <label htmlFor="name-register">ชื่อ-นามสกุล</label>
                                <input 
                                    type="text" 
                                    id="name-register" 
                                    className="input" 
                                    required 
                                    value={regName}
                                    onChange={(e) => setRegName(e.target.value)}
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="email-register">อีเมล</label>
                                <input 
                                    type="email" 
                                    id="email-register" 
                                    className="input" 
                                    required 
                                    value={regEmail}
                                    onChange={(e) => setRegEmail(e.target.value)}
                                    placeholder="user@gmail.com"
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="idCard">เลขบัตรประชาชน (13 หลัก)</label>
                                <input 
                                    type="text" 
                                    id="idCard" 
                                    className="input" 
                                    required 
                                    pattern="\d{13}" 
                                    title="กรุณากรอกเลขบัตรประชาชน 13 หลัก"
                                    value={regIdCard}
                                    onChange={(e) => setRegIdCard(e.target.value)}
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="password-register">รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)</label>
                                <input 
                                    type="password" 
                                    id="password-register" 
                                    className="input" 
                                    required 
                                    minLength="6"
                                    value={regPassword}
                                    onChange={(e) => setRegPassword(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="btn">สมัครสมาชิก</button>
                        </form>
                        <p className="text-center" style={{marginTop: '1.5rem', marginBottom: 0}}>
                            มีบัญชีอยู่แล้ว? 
                            <a 
                                href="#" 
                                className="auth-link" 
                                onClick={(e) => { e.preventDefault(); setView('login'); }}
                                style={{marginLeft: '5px'}}
                            >
                                เข้าสู่ระบบที่นี่
                            </a>
                        </p>
                    </div>
                </div>
            </div>
            
        </div>
    );
}

export default Login;