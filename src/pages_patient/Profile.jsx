import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// (CSS ถูก import ใน main.jsx แล้ว)

function Profile() {
    // --- State ---
    const navigate = useNavigate();
    const [view, setView] = useState('display'); 
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '', age: '', gender: '', height: '',
        weight: '', conditions: '', allergies: ''
    });

    // --- Effect (เมื่อคอมโพเนนต์โหลด) ---
    useEffect(() => {
        // (หน้านี้ถูก ProtectedRoute คุ้มครองอยู่แล้ว)
        const user = JSON.parse(sessionStorage.getItem('currentUser'));
        setCurrentUser(user);
        
        // (กรณี user เป็น null (ซึ่งไม่ควรเกิด) ให้ state เป็น object ว่าง)
        const profile = user?.healthProfile || {};
        setFormData({
            name: user?.name || '',
            age: profile.age || '',
            gender: profile.gender || '',
            height: profile.height || '',
            weight: profile.weight || '',
            conditions: profile.conditions || '',
            allergies: profile.allergies || '',
        });
        
    }, []); // (ทำงานแค่ครั้งเดียว)

    // --- Handlers ---
    const handleFormChange = (e) => {
        const { id, value } = e.target;
        const key = id.replace('profile-', ''); // 'profile-name' -> 'name'
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSaveProfile = (e) => {
        e.preventDefault();
        if (!currentUser) return;

        // (อ่าน DB จาก localStorage)
        let users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.id === currentUser.id);

        if (userIndex === -1) {
            // (กรณีเป็น User ที่ Login จำลอง แต่ยังไม่ได้ Register)
             alert('บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว (เฉพาะใน Session นี้)');
        } else {
             // (กรณีเป็น User ที่ Register แล้ว)
            users[userIndex].name = formData.name;
            users[userIndex].healthProfile = {
                age: formData.age,
                gender: formData.gender,
                height: formData.height,
                weight: formData.weight,
                conditions: formData.conditions,
                allergies: formData.allergies,
            };
            // (บันทึก DB ลง localStorage)
            localStorage.setItem('users', JSON.stringify(users)); 
        }
        
        // (อัปเดต User ปัจจุบัน)
        const updatedUser = {
            ...currentUser,
            name: formData.name,
            healthProfile: {
                age: formData.age,
                gender: formData.gender,
                height: formData.height,
                weight: formData.weight,
                conditions: formData.conditions,
                allergies: formData.allergies,
            }
        };

        // (อัปเดต Session)
        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser)); 
        setCurrentUser(updatedUser); 
        
        alert('บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว');
        setView('display'); 
    };

    const handleLogout = () => {
        if (window.confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
            sessionStorage.removeItem('currentUser');
            navigate('/login'); 
        }
    };
    
    const handleDeleteAccount = () => {
        if (!currentUser) return;
        
        if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการ "ปิดบัญชีถาวร"?\n\nการกระทำนี้ไม่สามารถย้อนกลับได้ และข้อมูลนัดหมายทั้งหมดของคุณจะถูกลบ`)) {
            
            // (ลบข้อมูลจาก DB ใน localStorage)
            let users = JSON.parse(localStorage.getItem('users')) || [];
            users = users.filter(u => u.id !== currentUser.id);
            localStorage.setItem('users', JSON.stringify(users));
            
            let requests = JSON.parse(localStorage.getItem('requests')) || [];
            requests = requests.filter(r => r.patient?.id !== currentUser.id);
            localStorage.setItem('requests', JSON.stringify(requests));
            
            let notifications = JSON.parse(localStorage.getItem('notifications')) || [];
            notifications = notifications.filter(n => n.patientId !== currentUser.id);
            localStorage.setItem('notifications', JSON.stringify(notifications));

            alert('บัญชีของคุณถูกลบเรียบร้อยแล้ว');
            
            sessionStorage.removeItem('currentUser');
            navigate('/login');
        }
    };

    const handleSettingsClick = (feature) => {
        alert(`ฟังก์ชัน ${feature} ยังไม่เปิดใช้งาน`);
    };

    // --- Loading State ---
    if (!currentUser) {
        // (หน้านี้ไม่ควรแสดงผลถ้านำ currentUser ออก 
        //  ProtectedRoute จะทำงานก่อน)
        return null; 
    }

    const profile = currentUser.healthProfile || {};

    // --- Render ---
    return (
        // (Layout จะใส่ Header ให้)
        <div id="page-profile" className="page active">
            <main className="container">
                
                {view === 'display' && (
                    <div id="profile-card-display" className="card patient-profile-card">
                        <div className="patient-card-header">
                            <div>
                                <h3 id="profile-card-name">{currentUser.name}</h3>
                                <p id="profile-card-email">{currentUser.email}</p>
                            </div>
                            <button id="edit-profile-btn" className="btn" onClick={() => setView('edit')} style={{width: 'auto', padding: '0.5rem 1rem'}}>
                                แก้ไข
                            </button>
                        </div>
                        <hr />
                        <h4>ข้อมูลสุขภาพ</h4>
                        <div className="profile-info-grid">
                            <div><small>อายุ</small><p id="profile-card-age">{profile.age ? `${profile.age} ปี` : 'N/A'}</p></div>
                            <div><small>เพศ</small><p id="profile-card-gender">{profile.gender || 'N/A'}</p></div>
                            <div><small>ส่วนสูง</small><p id="profile-card-height">{profile.height ? `${profile.height} ซม.` : 'N/A'}</p></div>
                            <div><small>น้ำหนัก</small><p id="profile-card-weight">{profile.weight ? `${profile.weight} กก.` : 'N/A'}</p></div>
                        </div>
                        <div className="profile-info-block" style={{ marginTop: '1rem' }}>
                            <small>โรคประจำตัว</small>
                            <p id="profile-card-conditions">{profile.conditions || 'ไม่มีข้อมูล'}</p>
                        </div>
                        <div className="profile-info-block">
                            <small>แพ้ยา</small>
                            <p id="profile-card-allergies">{profile.allergies || 'ไม่มีข้อมูล'}</p>
                        </div>
                    </div>
                )}

                {view === 'edit' && (
                    <div id="profile-form-container" className="card">
                        <h3>แก้ไขข้อมูลโปรไฟล์</h3>
                        <form id="profile-form" onSubmit={handleSaveProfile}>
                            <div className="input-group">
                                <label htmlFor="profile-name">ชื่อ-นามสกุล</label>
                                <input type="text" id="profile-name" className="input" required 
                                       value={formData.name} onChange={handleFormChange} />
                            </div>
                            <hr />
                            <h4>ข้อมูลสุขภาพ</h4>
                            <div className="grid cols-2">
                                <div className="input-group">
                                    <label htmlFor="profile-age">อายุ (ปี)</label>
                                    <input type="number" id="profile-age" className="input" placeholder="30"
                                           value={formData.age} onChange={handleFormChange} />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="profile-gender">เพศ</label>
                                    <select id="profile-gender" className="input"
                                            value={formData.gender} onChange={handleFormChange}>
                                        <option value="">-- เลือกเพศ --</option>
                                        <option value="ชาย">ชาย</option>
                                        <option value="หญิง">หญิง</option>
                                        <option value="อื่นๆ">อื่นๆ</option>
                                        <option value="ไม่ระบุ">ไม่ระบุ</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label htmlFor="profile-height">ส่วนสูง (ซม.)</label>
                                    <input type="number" id="profile-height" className="input" placeholder="170"
                                           value={formData.height} onChange={handleFormChange} />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="profile-weight">น้ำหนัก (กก.)</label>
                                    <input type="number" id="profile-weight" className="input" placeholder="65"
                                           value={formData.weight} onChange={handleFormChange} />
                                </div>
                            </div>
                            <div className="input-group">
                                <label htmlFor="profile-conditions">โรคประจำตัว (ถ้ามี)</label>
                                <textarea id="profile-conditions" className="input" rows="3" placeholder="เช่น ความดันโลหิตสูง, เบาหวาน"
                                          value={formData.conditions} onChange={handleFormChange}></textarea>
                            </div>
                            <div className="input-group">
                                <label htmlFor="profile-allergies">ประวัติการแพ้ยา (ถ้ามี)</label>
                                <textarea id="profile-allergies" className="input" rows="3" placeholder="เช่น Penicillin"
                                          value={formData.allergies} onChange={handleFormChange}></textarea>
                            </div>
                            <button type="submit" className="btn btn-success" style={{ width: '100%' }}>บันทึกข้อมูล</button>
                            <button type="button" className="btn btn-secondary" style={{ width: '100%', marginTop: '0.5rem' }} 
                                    onClick={() => setView('display')}>
                                ยกเลิก
                            </button>
                        </form>
                    </div>
                )}
                
                <h3 className="settings-header">การตั้งค่าบัญชี</h3>
                <div className="settings-list">
                    <a href="#" id="settings-account" className="settings-item" onClick={() => handleSettingsClick('บัญชี (อีเมล, เลขบัตร)')}>
                        <span>บัญชี (อีเมล, เลขบัตร)</span>
                        <span>&rsaquo;</span>
                    </a>
                    <a href="#" id="settings-password" className="settings-item" onClick={() => handleSettingsClick('เปลี่ยนรหัสผ่าน')}>
                        <span>เปลี่ยนรหัสผ่าน</span>
                        <span>&rsaquo;</span>
                    </a>
                    <a href="#" id="settings-language" className="settings-item" onClick={() => handleSettingsClick('ภาษา')}>
                        <span>ภาษา</span>
                        <span>&rsaquo;</span>
                    </a>
                </div>
                
                <h3 className="settings-header">ออกจากระบบ</h3>
                <div className="settings-list">
                    <a href="#" id="logout-btn" className="settings-item danger" onClick={handleLogout}>
                        <span>ออกจากระบบ</span>
                        <span>&rsaquo;</span>
                    </a>
                    <a href="#" id="delete-account-btn" className="settings-item danger" onClick={handleDeleteAccount}>
                        <span>ปิดบัญชีถาวร</span>
                        <span>&rsaquo;</span>
                    </a>
                </div>
                
            </main>
        </div>
    );
}

export default Profile;