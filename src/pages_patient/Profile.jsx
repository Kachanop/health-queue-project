import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

function Profile() {
    const { t } = useLanguage();
    // --- State ---
    const navigate = useNavigate();
    const [view, setView] = useState('display'); 
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '', idCard: '', age: '', gender: '', height: '', // เพิ่ม idCard ใน formData
        weight: '', conditions: '', allergies: ''
    });

    // --- Effect (เมื่อคอมโพเนนต์โหลด) ---
    useEffect(() => {
        const user = JSON.parse(sessionStorage.getItem('currentUser'));
        setCurrentUser(user);
        
        const profile = user?.healthProfile || {};
        setFormData({
            name: user?.name || '',
            idCard: user?.idCard || '', // ดึงเลขบัตรประชาชนมาใส่ state
            age: profile.age || '',
            gender: profile.gender || '',
            height: profile.height || '',
            weight: profile.weight || '',
            conditions: profile.conditions || '',
            allergies: profile.allergies || '',
        });
        
    }, []);

    // --- Handlers ---
    const handleFormChange = (e) => {
        const { id, value } = e.target;
        // จัดการ key ให้ตรงกับ state
        let key = id;
        if (id.startsWith('profile-')) {
             key = id.replace('profile-', '');
        }
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSaveProfile = (e) => {
        e.preventDefault();
        if (!currentUser) return;

        let users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.id === currentUser.id);

        if (userIndex === -1) {
             alert('บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว (เฉพาะใน Session นี้)');
        } else {
            users[userIndex].name = formData.name;
            users[userIndex].idCard = formData.idCard; // บันทึกเลขบัตร
            users[userIndex].healthProfile = {
                age: formData.age,
                gender: formData.gender,
                height: formData.height,
                weight: formData.weight,
                conditions: formData.conditions,
                allergies: formData.allergies,
            };
            localStorage.setItem('users', JSON.stringify(users)); 
        }
        
        const updatedUser = {
            ...currentUser,
            name: formData.name,
            idCard: formData.idCard, // อัปเดตเลขบัตรใน object ปัจจุบัน
            healthProfile: {
                age: formData.age,
                gender: formData.gender,
                height: formData.height,
                weight: formData.weight,
                conditions: formData.conditions,
                allergies: formData.allergies,
            }
        };

        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser)); 
        setCurrentUser(updatedUser); 
        
        alert(t('profileSaved'));
        setView('display'); 
    };

    const handleLogout = () => {
        if (window.confirm(t('confirmLogout'))) {
            sessionStorage.removeItem('currentUser');
            navigate('/login'); 
        }
    };
    
    const handleDeleteAccount = () => {
        if (!currentUser) return;
        
        if (window.confirm(t('confirmDeleteAccount'))) {
            let users = JSON.parse(localStorage.getItem('users')) || [];
            users = users.filter(u => u.id !== currentUser.id);
            localStorage.setItem('users', JSON.stringify(users));
            
            let requests = JSON.parse(localStorage.getItem('requests')) || [];
            requests = requests.filter(r => r.patient?.id !== currentUser.id);
            localStorage.setItem('requests', JSON.stringify(requests));
            
            let notifications = JSON.parse(localStorage.getItem('notifications')) || [];
            notifications = notifications.filter(n => n.patientId !== currentUser.id);
            localStorage.setItem('notifications', JSON.stringify(notifications));

            alert(t('accountDeleted'));
            
            sessionStorage.removeItem('currentUser');
            navigate('/login');
        }
    };

    const handleSettingsClick = (feature) => {
        alert(`${t('featureNotAvailable')}: ${feature}`);
    };

    if (!currentUser) return null; 

    const profile = currentUser.healthProfile || {};

    return (
        <div id="page-profile" className="page active">
            <main className="container">
                
                {view === 'display' && (
                    <div id="profile-card-display" className="card patient-profile-card">
                        <div className="patient-card-header">
                            <div>
                                <h3 id="profile-card-name">{currentUser.name}</h3>
                                <p id="profile-card-email">{currentUser.email}</p>
                                {/* แสดงเลขบัตรประชาชนตรงนี้ */}
                                <p style={{fontSize: '0.85rem', color: '#888', marginTop: '4px'}}>
                                    {t('idCard')}: {currentUser.idCard || '-'}
                                </p>
                            </div>
                            <button id="edit-profile-btn" className="btn" onClick={() => setView('edit')} style={{width: 'auto', padding: '0.5rem 1rem'}}>
                                {t('edit')}
                            </button>
                        </div>
                        <hr />
                        <h4>{t('healthInfo')}</h4>
                        <div className="profile-info-grid">
                            <div><small>{t('age')}</small><p id="profile-card-age">{profile.age ? `${profile.age} ${t('years')}` : 'N/A'}</p></div>
                            <div><small>{t('gender')}</small><p id="profile-card-gender">{profile.gender || 'N/A'}</p></div>
                            <div><small>{t('height')}</small><p id="profile-card-height">{profile.height ? `${profile.height} ${t('cm')}` : 'N/A'}</p></div>
                            <div><small>{t('weight')}</small><p id="profile-card-weight">{profile.weight ? `${profile.weight} ${t('kg')}` : 'N/A'}</p></div>
                        </div>
                        <div className="profile-info-block" style={{ marginTop: '1rem' }}>
                            <small>{t('chronicDiseases')}</small>
                            <p id="profile-card-conditions">{profile.conditions || t('noData')}</p>
                        </div>
                        <div className="profile-info-block">
                            <small>{t('drugAllergies')}</small>
                            <p id="profile-card-allergies">{profile.allergies || t('noData')}</p>
                        </div>
                    </div>
                )}

                {view === 'edit' && (
                    <div id="profile-form-container" className="card">
                        <h3>{t('editProfile')}</h3>
                        <form id="profile-form" onSubmit={handleSaveProfile}>
                            <div className="input-group">
                                <label htmlFor="profile-name">{t('name')}</label>
                                <input type="text" id="profile-name" className="input" required 
                                       value={formData.name} onChange={handleFormChange} />
                            </div>
                            <div className="input-group">
                                <label htmlFor="profile-idCard">{t('idCard')}</label>
                                <input type="text" id="profile-idCard" className="input" 
                                       value={formData.idCard} onChange={handleFormChange}
                                       pattern="\d{13}" title="13 หลัก" />
                            </div>
                            <hr />
                            <h4>{t('healthInfo')}</h4>
                            <div className="grid cols-2">
                                <div className="input-group">
                                    <label htmlFor="profile-age">{t('age')} ({t('years')})</label>
                                    <input type="number" id="profile-age" className="input" placeholder="30"
                                           value={formData.age} onChange={handleFormChange} />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="profile-gender">{t('gender')}</label>
                                    <select id="profile-gender" className="input"
                                            value={formData.gender} onChange={handleFormChange}>
                                        <option value="">-- {t('gender')} --</option>
                                        <option value="ชาย">{t('male')}</option>
                                        <option value="หญิง">{t('female')}</option>
                                        <option value="อื่นๆ">{t('other')}</option>
                                        <option value="ไม่ระบุ">{t('notSpecified')}</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label htmlFor="profile-height">{t('height')} ({t('cm')})</label>
                                    <input type="number" id="profile-height" className="input" placeholder="170"
                                           value={formData.height} onChange={handleFormChange} />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="profile-weight">{t('weight')} ({t('kg')})</label>
                                    <input type="number" id="profile-weight" className="input" placeholder="65"
                                           value={formData.weight} onChange={handleFormChange} />
                                </div>
                            </div>
                            <div className="input-group">
                                <label htmlFor="profile-conditions">{t('chronicDiseasesOptional')}</label>
                                <textarea id="profile-conditions" className="input" rows="3" placeholder="เช่น ความดันโลหิตสูง, เบาหวาน"
                                          value={formData.conditions} onChange={handleFormChange}></textarea>
                            </div>
                            <div className="input-group">
                                <label htmlFor="profile-allergies">{t('drugAllergiesOptional')}</label>
                                <textarea id="profile-allergies" className="input" rows="3" placeholder="เช่น Penicillin"
                                          value={formData.allergies} onChange={handleFormChange}></textarea>
                            </div>
                            <button type="submit" className="btn btn-success" style={{ width: '100%' }}>{t('saveData')}</button>
                            <button type="button" className="btn btn-secondary" style={{ width: '100%', marginTop: '0.5rem' }} 
                                    onClick={() => setView('display')}>
                                {t('cancel')}
                            </button>
                        </form>
                    </div>
                )}
                
                {/* ... ส่วนเมนู Setting ด้านล่างเหมือนเดิม ... */}
                <h3 className="settings-header">{t('accountSettings')}</h3>
                <div className="settings-list">
                    <a href="#" id="settings-account" className="settings-item" onClick={() => handleSettingsClick(t('accountEmailId'))}>
                        <span>{t('accountEmailId')}</span>
                        <span>&rsaquo;</span>
                    </a>
                    <a href="#" id="settings-password" className="settings-item" onClick={() => handleSettingsClick(t('changePassword'))}>
                        <span>{t('changePassword')}</span>
                        <span>&rsaquo;</span>
                    </a>
                    <a href="#" id="settings-language" className="settings-item" onClick={() => handleSettingsClick(t('language'))}>
                        <span>{t('language')}</span>
                        <span>&rsaquo;</span>
                    </a>
                </div>
                
                <h3 className="settings-header">{t('logout')}</h3>
                <div className="settings-list">
                    <a href="#" id="logout-btn" className="settings-item danger" onClick={handleLogout}>
                        <span>{t('logout')}</span>
                        <span>&rsaquo;</span>
                    </a>
                    <a href="#" id="delete-account-btn" className="settings-item danger" onClick={handleDeleteAccount}>
                        <span>{t('deleteAccount')}</span>
                        <span>&rsaquo;</span>
                    </a>
                </div>
                
            </main>
        </div>
    );
}

export default Profile;