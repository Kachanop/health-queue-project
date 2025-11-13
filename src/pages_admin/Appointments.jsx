import React, { useState, useEffect, useMemo } from 'react';
// (CSS ถูก import ใน main.jsx แล้ว)

// (Component: Modal แก้ไขคนไข้)
function EditPatientModal({ user, requests, isOpen, onClose, onSave }) {
    const [formData, setFormData] = useState({});
    const [healthData, setHealthData] = useState({});

    useEffect(() => {
        if (user) {
            setFormData({
                id: user.id || '',
                name: user.name || '',
                email: user.email || '',
                idCard: user.idCard || '',
            });
            setHealthData(user.healthProfile || {});
        }
    }, [user]);

    // (กรองประวัติการนัดหมาย)
    const patientHistory = useMemo(() => {
        if (!user) return [];
        // (อ่าน DB จาก localStorage)
        return requests
            .filter(r => r.patient?.id === user.id)
            .sort((a, b) => b.id - a.id);
    }, [user, requests]);

    if (!isOpen || !user) return null;

    const handleChange = (e) => {
        const key = e.target.id.replace('edit-patient-', ''); 
        setFormData(prev => ({ ...prev, [key]: e.target.value }));
    };
    const handleHealthChange = (e) => {
        const key = e.target.id.replace('edit-patient-', '');
        setHealthData(prev => ({ ...prev, [key]: e.target.value }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(user.id, { ...formData, healthProfile: healthData });
        onClose();
    };
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div id="edit-patient-modal" className="modal-overlay active" onClick={handleBackdropClick}>
            <div className="modal-content">
                <button id="close-modal-btn" className="modal-close-btn" onClick={onClose}>&times;</button>
                <h3>แก้ไขข้อมูลคนไข้</h3>
                <form id="edit-patient-form" onSubmit={handleSubmit}>
                    
                    <h4>ข้อมูลส่วนตัว</h4>
                    <div className="input-group">
                        <label htmlFor="edit-patient-name">ชื่อ-นามสกุล</label>
                        <input type="text" id="edit-patient-name" className="input" required 
                               value={formData.name} onChange={handleChange} />
                    </div>
                    <div className="input-group">
                        <label htmlFor="edit-patient-email">อีเมล</label>
                        <input type="email" id="edit-patient-email" className="input" required 
                               value={formData.email} onChange={handleChange} />
                    </div>
                    <div className="input-group">
                        <label htmlFor="edit-patient-idcard">เลขบัตรประชาชน</label>
                        <input type="text" id="edit-patient-idcard" className="input" pattern="\d{13}"
                               value={formData.idCard} onChange={handleChange} />
                    </div>
                    
                    <hr />
                    <h4>ข้อมูลสุขภาพ</h4>
                    <div className="grid cols-2">
                        <div className="input-group">
                            <label htmlFor="edit-patient-age">อายุ (ปี)</label>
                            <input type="number" id="edit-patient-age" className="input" 
                                   value={healthData.age || ''} onChange={handleHealthChange} />
                        </div>
                        <div className="input-group">
                            <label htmlFor="edit-patient-gender">เพศ</label>
                            <select id="edit-patient-gender" className="input" 
                                    value={healthData.gender || ''} onChange={handleHealthChange}>
                                <option value="">-- เลือกเพศ --</option>
                                <option value="ชาย">ชาย</option>
                                <option value="หญิง">หญิง</option>
                                <option value="อื่นๆ">อื่นๆ</option>
                                <option value="ไม่ระบุ">ไม่ระบุ</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label htmlFor="edit-patient-height">ส่วนสูง (ซม.)</label>
                            <input type="number" id="edit-patient-height" className="input" 
                                   value={healthData.height || ''} onChange={handleHealthChange} />
                        </div>
                        <div className="input-group">
                            <label htmlFor="edit-patient-weight">น้ำหนัก (กก.)</label>
                            <input type="number" id="edit-patient-weight" className="input" 
                                   value={healthData.weight || ''} onChange={handleHealthChange} />
                        </div>
                    </div>
                    <div className="input-group">
                        <label htmlFor="edit-patient-conditions">โรคประจำตัว (ถ้ามี)</label>
                        <textarea id="edit-patient-conditions" className="input" rows="3"
                                  value={healthData.conditions || ''} onChange={handleHealthChange}></textarea>
                    </div>
                    <div className="input-group">
                        <label htmlFor="edit-patient-allergies">ประวัติการแพ้ยา (ถ้ามี)</label>
                        <textarea id="edit-patient-allergies" className="input" rows="3"
                                  value={healthData.allergies || ''} onChange={handleHealthChange}></textarea>
                    </div>
                    
                    <hr />
                    
                    <h4>ประวัติการนัดหมาย</h4>
                    <div id="modal-patient-history-list" className="modal-history-list" style={{maxHeight: '150px', overflowY: 'auto', background: '#f9f9f9', padding: '0.5rem'}}>
                        {patientHistory.length === 0 ? (
                            <p className="text-center">ยังไม่มีประวัติการนัดหมาย</p>
                        ) : (
                            patientHistory.map(r => {
                                const itemClass = r.status === 'confirmed' ? 'status-confirmed' : (r.status === 'rejected' ? 'status-rejected' : 'status-pending');
                                const statusText = r.status === 'confirmed' ? 'ยืนยันแล้ว' : (r.status === 'rejected' ? 'ถูกปฏิเสธ' : 'รอดำเนินการ');
                                return (
                                    <div key={r.id} className={`history-item ${itemClass}`} style={{borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '0.5rem'}}>
                                        <p><strong>แพทย์:</strong> {r.doctor?.name || 'N/A'}</p>
                                        <p><strong>วัน-เวลา:</strong> {r.date} {r.time}</p>
                                        <p><strong>สถานะ:</strong> {statusText}</p>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    
                    <hr />
                    
                    <button type="submit" className="btn btn-success">บันทึกการเปลี่ยนแปลง</button>
                </form>
            </div>
        </div>
    );
}


// (Component: หน้าหลักจัดการคนไข้)
function Appointments() { 
    
    // --- State ---
    const [users, setUsers] = useState([]);
    const [requests, setRequests] = useState([]); 
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // --- Data Loading ---
    useEffect(() => {
        // (อ่าน DB จาก localStorage)
        const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
        const storedRequests = JSON.parse(localStorage.getItem('requests')) || [];
        setUsers(storedUsers);
        setRequests(storedRequests);
    }, []); 

    /**
     * อัปเดต Badge ใน NavbarAdmin
     */
    useEffect(() => {
        try {
            const patientCountBadge = document.getElementById('patient-count-badge');
            if (patientCountBadge) patientCountBadge.textContent = users.length || '0';
        } catch(e) {
            console.error("Failed to update patient count badge:", e);
        }
    }, [users]); // (ทำงานใหม่เมื่อ users เปลี่ยน)


    // --- Helper ---
    const saveUsersData = (updatedUsers) => {
        setUsers(updatedUsers);
        // (บันทึก DB ลง localStorage)
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        // (อัปเดต Badge อีกครั้ง)
        const patientCountBadge = document.getElementById('patient-count-badge');
        if (patientCountBadge) patientCountBadge.textContent = updatedUsers.length || '0';
    };
    
    // --- Memoized Data (กรองข้อมูล) ---
    const filteredUsers = useMemo(() => {
        const term = searchTerm.toLowerCase();
        if (!term) return users;
        return users.filter(user => 
            user.name.toLowerCase().includes(term) ||
            (user.idCard && user.idCard.includes(term))
        );
    }, [users, searchTerm]);

    // --- Event Handlers (Modal) ---
    const handleOpenModal = (userId) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            setCurrentUser(user);
            setIsModalOpen(true);
        } else {
            alert('ไม่พบข้อมูลคนไข้');
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentUser(null);
    };

    const handleSaveUser = (userId, updatedData) => {
        const updatedUsers = users.map(u => {
            if (u.id === userId) {
                return { ...u, ...updatedData };
            }
            return u;
        });
        saveUsersData(updatedUsers); // (อัปเดต DB ใน localStorage)

        // 🔹 [FIX] 🔹
        // (ลบ Logic ที่พยายามอัปเดต session ของคนไข้ออกแล้ว)
        
        alert('แก้ไขข้อมูลคนไข้เรียบร้อยแล้ว');
    };

    // --- Event Handlers (Page) ---
    const handleDeletePatient = (userId) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;
        
        if (window.confirm(`คุณต้องการลบคนไข้ "${user.name}" (ID: ${user.id}) ออกจากระบบใช่หรือไม่?`)) {
            const updatedUsers = users.filter(u => u.id !== userId);
            saveUsersData(updatedUsers); // (อัปเดต DB ใน localStorage)
            alert('ลบคนไข้เรียบร้อยแล้ว');
        }
    };

    // --- Render Function ---
    return (
        // (Layout จะใส่ Header ให้)
        <div id="page-manage-patients" className="page active">
            <main className="container">
                <div className="list-header">
                    <h4>รายชื่อคนไข้ทั้งหมด</h4>
                    <div className="search-bar">
                        <input 
                            type="search" 
                            id="patient-search-input" 
                            className="input" 
                            placeholder="ค้นหาด้วยชื่อ หรือ เลขบัตร..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div id="patient-manage-list" style={{background: 'white', borderRadius: '12px', overflow: 'hidden'}}>
                    {filteredUsers.length === 0 ? (
                        <p className="text-center" style={{padding: '1rem'}}>
                            {searchTerm ? "ไม่พบคนไข้ที่ตรงกับคำค้นหา" : "ยังไม่มีคนไข้ในระบบ"}
                        </p>
                    ) : (
                        filteredUsers.map(user => {
                            const profile = user.healthProfile || {};
                            return (
                                <div key={user.id} className="patient-list-item">
                                    <div className="item-info">
                                        <div>
                                            <h4>{user.name} <small>(ID: {user.id})</small></h4>
                                            <p><strong>อีเมล:</strong> {user.email}</p>
                                            <p><strong>เลขบัตร:</strong> {user.idCard || 'N/A'}</p>
                                            <p><strong>โรคประจำตัว:</strong> {profile.conditions || 'N/A'} | <strong>แพ้ยา:</strong> {profile.allergies || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="admin-actions">
                                        <button className="btn btn-secondary" onClick={() => handleOpenModal(user.id)}>แก้ไขข้อมูล</button>
                                        <button className="btn btn-danger" onClick={() => handleDeletePatient(user.id)}>ลบคนไข้</button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </main>
            
            <EditPatientModal
                user={currentUser}
                requests={requests} // (ส่ง DB requests เข้าไป)
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveUser}
            />
        </div>
    );
}

export default Appointments;