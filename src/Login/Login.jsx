import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

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
    const { t } = useLanguage();
    // --- State ---
    const [view, setView] = useState('login'); // 'login' or 'register'
    const [regStep, setRegStep] = useState(1); // 🔹 เพิ่ม State สำหรับขั้นตอนการสมัคร (1 หรือ 2)
    
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

    // State สำหรับฟอร์ม Register (ข้อมูลบัญชี)
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regIdCard, setRegIdCard] = useState('');

    // State สำหรับฟอร์ม Register (ข้อมูลสุขภาพ - เพิ่มใหม่)
    const [regAge, setRegAge] = useState('');
    const [regGender, setRegGender] = useState('ไม่ระบุ');
    const [regHeight, setRegHeight] = useState('');
    const [regWeight, setRegWeight] = useState('');
    const [regConditions, setRegConditions] = useState(''); // โรคประจำตัว
    const [regAllergies, setRegAllergies] = useState('');   // แพ้ยา

    // --- 1. Login Handler ---
    const handleLogin = (e) => {
        e.preventDefault();
        
        const email = loginEmail.trim();

        // 1. ตรวจสอบ Admin (Mock) - ยกเว้น @admin.com ให้เข้าระบบได้
        if (email.endsWith('@admin.com')) {
            const mockAdmin = { 
                name: email.split('@')[0], 
                email: email, 
                role: 'admin',
                id: 'admin_' + Date.now()
            };
            sessionStorage.setItem('currentUser', JSON.stringify(mockAdmin)); 
            navigate(fromAdmin, { replace: true });

        } else {
            // ตรวจสอบ User ทั่วไป: ต้องใช้ @gmail.com เท่านั้น
            if (!email.endsWith('@gmail.com')) {
                alert(t('generalUserGmailOnly'));
                return;
            }

            // --- 2. เข้าสู่ระบบ (คนไข้) ---
            const users = JSON.parse(localStorage.getItem('users')) || []; 
            const user = users.find(u => u.email === email);
            
            if (!user) {
                alert(t('userNotFound'));
                return; 
            }

            if (user.password !== loginPassword) {
                alert(t('wrongPassword'));
                return;
            }
            
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            navigate(fromPatient, { replace: true });
        }
    };

    // --- 2. Register Helpers ---
    
    // ฟังก์ชันตรวจสอบข้อมูลก่อนไปขั้นตอนที่ 2
    const handleNextStep = () => {
        // Validation ง่ายๆ
        if (!regName || !regEmail || !regIdCard || !regPassword) {
            alert(t('fillAllAccountInfo'));
            return;
        }
        
        // 🔹 ตรวจสอบอีเมลตอนสมัครสมาชิก: ต้องใช้ @gmail.com เท่านั้น
        if (!regEmail.trim().endsWith('@gmail.com')) {
            alert(t('useGmailOnly'));
            return;
        }

        if (regIdCard.length !== 13) {
            alert(t('idCard13Required'));
            return;
        }
        if (regPassword.length < 6) {
            alert(t('passwordMin6Required'));
            return;
        }
        // ถ้าผ่านหมด ไปขั้นตอนที่ 2
        setRegStep(2);
    };

    const handlePrevStep = () => {
        setRegStep(1);
    };

    // Handler สมัครสมาชิก (ทำงานเมื่อกด Submit ในขั้นตอนสุดท้าย)
    const handleRegister = (e) => {
        e.preventDefault();
        
        const users = JSON.parse(localStorage.getItem('users')) || []; 
        
        if (users.find(u => u.email === regEmail)) {
            alert(t('emailAlreadyUsed'));
            return;
        }
        
        const newUser = { 
            id: Date.now(), 
            name: regName, 
            email: regEmail, 
            password: regPassword, 
            idCard: regIdCard, // บันทึกเลขบัตร
            healthProfile: {   // บันทึกข้อมูลสุขภาพตั้งเเต่สมัคร
                age: regAge,
                gender: regGender,
                height: regHeight,
                weight: regWeight,
                conditions: regConditions || t('none'),
                allergies: regAllergies || t('none')
            }
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users)); 
        
        alert(t('registerSuccess'));
        
        // เคลียร์ค่าและกลับไปหน้า Login
        setRegName(''); setRegEmail(''); setRegPassword(''); setRegIdCard('');
        setRegAge(''); setRegGender(t('notSpecified')); setRegHeight(''); setRegWeight('');
        setRegConditions(''); setRegAllergies('');
        setRegStep(1); // รีเซ็ตขั้นตอนกลับเป็น 1
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
                        <h2 style={{textAlign: 'center', marginBottom: '10px'}}>{t('loginTitle')}</h2>
                        <p style={{fontSize: '0.9rem', color: '#666', textAlign: 'center', marginBottom: '20px'}}>
                            {t('loginDesc')}
                        </p>
                        
                        <form id="login-form" onSubmit={handleLogin}>
                            <div className="input-group">
                                <label htmlFor="email">{t('email')}</label>
                                <input 
                                    type="email" id="email" className="input" required 
                                    value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                                    placeholder="user@gmail.com"
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="password">{t('password')}</label>
                                <input 
                                    type="password" id="password" className="input" required 
                                    value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                                    placeholder={t('enterPassword')}
                                />
                            </div>
                            <button type="submit" className="btn">{t('login')}</button>
                        </form>
                        <p className="text-center" style={{marginTop: '1.5rem', marginBottom: 0}}>
                            {t('noAccount')} 
                            <a href="#" className="auth-link" onClick={(e) => { e.preventDefault(); setView('register'); }} style={{marginLeft: '5px'}}>
                                {t('registerHere')}
                            </a>
                        </p>
                    </div>
                </div>
            </div>
            
            {/* 1b. หน้า Register (แบ่ง Step) */}
            <div 
                id="page-register" 
                style={{ display: view === 'register' ? 'block' : 'none', width: '100%', maxWidth: '600px' }}
            >
                <div className="container" style={{padding: 0}}>
                    <div className="card">
                        <h2 style={{textAlign: 'center', marginBottom: '10px'}}>{t('register')}</h2>
                        <p style={{textAlign: 'center', marginBottom: '20px'}}>
                            {regStep === 1 ? t('step1AccountInfo') : t('step2HealthInfo')}
                        </p>
                        
                        {/* Progress Bar เล็กๆ เพื่อบอกขั้นตอน */}
                        <div style={{display: 'flex', gap: '5px', marginBottom: '20px', justifyContent: 'center'}}>
                            <div style={{height: '4px', width: '30px', background: '#007bff', borderRadius: '2px'}}></div>
                            <div style={{height: '4px', width: '30px', background: regStep === 2 ? '#007bff' : '#eee', borderRadius: '2px'}}></div>
                        </div>

                        <form id="register-form" onSubmit={handleRegister}>
                            
                            {/* --- ขั้นตอนที่ 1: ข้อมูลบัญชี --- */}
                            {regStep === 1 && (
                                <div className="step-1-content">
                                    <h4 style={{marginTop: '0', borderBottom: '1px solid #eee', paddingBottom: '5px'}}>1. {t('accountInfo')}</h4>
                                    <div className="input-group">
                                        <label htmlFor="name-register">{t('name')}</label>
                                        <input 
                                            type="text" id="name-register" className="input" required={regStep === 1}
                                            value={regName} onChange={(e) => setRegName(e.target.value)}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label htmlFor="email-register">{t('emailGmailOnly')}</label>
                                        <input 
                                            type="email" id="email-register" className="input" required={regStep === 1}
                                            value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                                            placeholder="user@gmail.com"
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label htmlFor="idCard">{t('idCard13')}</label>
                                        <input 
                                            type="text" id="idCard" className="input" required={regStep === 1}
                                            pattern="\d{13}" title="กรุณากรอกเลขบัตรประชาชน 13 หลัก"
                                            value={regIdCard} onChange={(e) => setRegIdCard(e.target.value)}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label htmlFor="password-register">{t('passwordMin6')}</label>
                                        <input 
                                            type="password" id="password-register" className="input" required={regStep === 1} minLength="6"
                                            value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                                        />
                                    </div>
                                    
                                    {/* ปุ่มถัดไป (type button เพื่อไม่ให้ submit form) */}
                                    <button type="button" className="btn" style={{marginTop: '1rem'}} onClick={handleNextStep}>
                                        {t('next')}
                                    </button>
                                </div>
                            )}

                            {/* --- ขั้นตอนที่ 2: ข้อมูลสุขภาพ --- */}
                            {regStep === 2 && (
                                <div className="step-2-content">
                                    <h4 style={{marginTop: '0', borderBottom: '1px solid #eee', paddingBottom: '5px'}}>2. {t('healthInfo')}</h4>
                                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                                        <div className="input-group">
                                            <label htmlFor="reg-age">{t('age')} ({t('years')})</label>
                                            <input 
                                                type="number" id="reg-age" className="input" required={regStep === 2}
                                                value={regAge} onChange={(e) => setRegAge(e.target.value)}
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label htmlFor="reg-gender">{t('gender')}</label>
                                            <select 
                                                id="reg-gender" className="input" required={regStep === 2}
                                                value={regGender} onChange={(e) => setRegGender(e.target.value)}
                                            >
                                                <option value={t('notSpecified')}>{t('notSpecified')}</option>
                                                <option value={t('male')}>{t('male')}</option>
                                                <option value={t('female')}>{t('female')}</option>
                                                <option value={t('other')}>{t('other')}</option>
                                            </select>
                                        </div>
                                        <div className="input-group">
                                            <label htmlFor="reg-height">{t('height')} ({t('cm')})</label>
                                            <input 
                                                type="number" id="reg-height" className="input" required={regStep === 2}
                                                value={regHeight} onChange={(e) => setRegHeight(e.target.value)}
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label htmlFor="reg-weight">{t('weight')} ({t('kg')})</label>
                                            <input 
                                                type="number" id="reg-weight" className="input" required={regStep === 2}
                                                value={regWeight} onChange={(e) => setRegWeight(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <label htmlFor="reg-conditions">{t('chronicDiseasesOptional')}</label>
                                        <input 
                                            type="text" id="reg-conditions" className="input" 
                                            value={regConditions} onChange={(e) => setRegConditions(e.target.value)}
                                            placeholder="เช่น ความดัน, เบาหวาน"
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label htmlFor="reg-allergies">{t('drugAllergiesOptional')}</label>
                                        <input 
                                            type="text" id="reg-allergies" className="input" 
                                            value={regAllergies} onChange={(e) => setRegAllergies(e.target.value)}
                                            placeholder="เช่น แพ้อาหารทะเล"
                                        />
                                    </div>

                                    <div style={{display: 'flex', gap: '10px', marginTop: '1rem'}}>
                                        <button type="button" className="btn" style={{backgroundColor: '#6c757d'}} onClick={handlePrevStep}>
                                            {t('previous')}
                                        </button>
                                        <button type="submit" className="btn">
                                            {t('register')}
                                        </button>
                                    </div>
                                </div>
                            )}

                        </form>
                        <p className="text-center" style={{marginTop: '1.5rem', marginBottom: 0}}>
                            {t('haveAccount')} 
                            <a 
                                href="#" className="auth-link" onClick={(e) => { e.preventDefault(); setView('login'); setRegStep(1); }}
                                style={{marginLeft: '5px'}}
                            >
                                {t('loginHere')}
                            </a>
                        </p>
                    </div>
                </div>
            </div>
            
        </div>
    );
}

export default Login;