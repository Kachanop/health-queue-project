import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// 🔹 [FIX 1] 🔹
// (สร้าง Object Style สำหรับจัดกลางหน้าจอ)
const authPageStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',    /* 👈 จัดกลางแนวตั้ง */
  justifyContent: 'center', /* 👈 จัดกลางแนวนอน */
  padding: '1rem',
  boxSizing: 'border-box',
  // (เพิ่มสีพื้นหลังให้เหมือน app.css)
  backgroundColor: '#f4f7f6' 
};


function Login() {
    // --- State ---
    const [view, setView] = useState('login'); // 'login' or 'register'
    const navigate = useNavigate();
    const location = useLocation();
    
    // (Logic การจำหน้า 'from')
    const fromPath = location.state?.from?.pathname; 
    let fromPatient;
    let fromAdmin;
    if (fromPath && fromPath.startsWith('/admin')) {
        fromAdmin = fromPath;
        fromPatient = "/patient/home";
    } else if (fromPath && fromPath.startsWith('/patient')) {
        fromPatient = fromPath;
        fromAdmin = "/admin/home";
    } else {
        fromPatient = "/patient/home";
        fromAdmin = "/admin/home";
    }

    // (State สำหรับฟอร์ม Login)
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // (State สำหรับฟอร์ม Register)
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regIdCard, setRegIdCard] = useState('');

    // --- 1. Login Handler ---
    const handleLogin = (e) => {
        e.preventDefault();
        
        if (loginEmail.endsWith('@admin.com')) {
            // --- 1. เข้าสู่ระบบ (แอดมิน) ---
            const mockAdmin = { 
                name: loginEmail.split('@')[0], 
                email: loginEmail, 
                role: 'admin',
                id: 'admin_' + Date.now()
            };
            sessionStorage.setItem('currentUser', JSON.stringify(mockAdmin)); 
            navigate(fromAdmin, { replace: true });

        } else if (loginEmail.endsWith('@gmail.com')) {
            // --- 2. เข้าสู่ระบบ (คนไข้) ---
            const users = JSON.parse(localStorage.getItem('users')) || []; 
            let user = users.find(u => u.email === loginEmail);
            
            if (!user) {
                console.warn(`Login: User ${loginEmail} ไม่พบในระบบ(จำลอง). สร้างข้อมูลจำลอง...`);
                user = { 
                    id: Date.now(), 
                    name: loginEmail.split('@')[0], 
                    email: loginEmail, 
                    password: loginPassword, 
                    idCard: '',
                    healthProfile: {} 
                };
            }
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            navigate(fromPatient, { replace: true });

        } else {
            alert('อีเมลจำลองต้องลงท้ายด้วย @gmail.com (สำหรับคนไข้) หรือ @admin.com (สำหรับแอดมิน)');
        }
    };

    // --- 2. Register Handler ---
    const handleRegister = (e) => {
        e.preventDefault();
        
        const users = JSON.parse(localStorage.getItem('users')) || []; 
        
        if (users.find(u => u.email === regEmail)) {
            alert("อีเมลนี้ถูกใช้งานแล้ว (ในระบบจำลอง)");
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
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users)); 
        
        alert("สมัครสมาชิก (จำลอง) สำเร็จ! กรุณาเข้าสู่ระบบ");
        
        setRegName('');
        setRegEmail('');
        setRegPassword('');
        setRegIdCard('');
        setView('login');
    };

    // --- 3. Render ---
    return (
        // 🔹 [FIX 2] 🔹
        // (ลบ className="auth-page" ออก)
        // (ใช้ style={authPageStyle} แทน)
        <div 
          id="auth-container" 
          style={authPageStyle}
        >

            {/* 1a. หน้า Login */}
            <div 
                id="page-login" 
                style={{ display: view === 'login' ? 'block' : 'none', width: '100%', maxWidth: '450px' }}
            >
                {/* (เราต้องใช้ .card, .input-group, .btn จาก app.css
                   ถ้าไฟล์ app.css ของคุณยัง import ไม่ติด 
                   สไตล์ปุ่มและการ์ดก็จะหายไป 
                   แต่มันจะ "อยู่ตรงกลาง" แน่นอนครับ)
                */}
                <div className="container" style={{padding: 0}}>
                    <div className="card">
                        <h2>เข้าสู่ระบบ Health Queue (จำลอง)</h2>
                        <p>@gmail.com (คนไข้) / @admin.com (แอดมิน)</p>
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
                                    placeholder="patient@gmail.com หรือ admin@admin.com"
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
                                    placeholder="รหัสอะไรก็ได้"
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
                        <h2>สมัครสมาชิก (จำลอง)</h2>
                        <p>สร้างบัญชี (คนไข้) ใหม่เพื่อเริ่มใช้งาน</p>
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
                                    placeholder="new_patient@gmail.com"
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="idCard">เลขบัตรประชาชน</label>
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