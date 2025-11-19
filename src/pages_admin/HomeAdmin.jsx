import React, { useState, useEffect, useMemo } from 'react';
import emailjs from '@emailjs/browser';
// (CSS ถูก import ใน main.jsx แล้ว)

// (Config EmailJS)
const EMAILJS_CONFIG = {
    PUBLIC_KEY: "QWWAWjIdVvqW0oQSn",
    SERVICE_ID: "service_gbcxqzd",
    TEMPLATE_ID_NOTIFY_DOCTOR: "template_qje00uc" // (ID สำหรับส่งหาหมอ)
};

function HomeAdmin() {
    // --- State ---
    const [view, setView] = useState('home'); // 'home', 'new', 'approved'
    const [requests, setRequests] = useState([]);
    const [users, setUsers] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState({});
    const [rejectionMessages, setRejectionMessages] = useState({});

    // --- Data Loading (Effect) ---
    useEffect(() => {
        // (อ่าน DB จาก localStorage)
        const storedRequests = JSON.parse(localStorage.getItem('requests')) || [];
        const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
        const storedNotifications = JSON.parse(localStorage.getItem('notifications')) || [];
        
        setRequests(storedRequests);
        setUsers(storedUsers);
        setNotifications(storedNotifications);

        try {
            emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
        } catch (e) {
            console.error("EmailJS SDK (HomeAdmin.jsx) init failed.", e);
        }
    }, []);

    // --- Helpers ---
    const saveRequestsData = (updatedRequests) => {
        setRequests(updatedRequests);
        localStorage.setItem('requests', JSON.stringify(updatedRequests));
    };
    const saveNotifications = (updatedNotifications) => {
        setNotifications(updatedNotifications);
        localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    };

    // --- Memoized Data ---
    const newRequests = useMemo(() => 
        requests.filter(r => r && r.status === 'new')
    , [requests]);
    const approvedRequests = useMemo(() => 
        requests.filter(r => r && r.status === 'approved')
    , [requests]);

    /**
     * อัปเดต Badge ใน NavbarAdmin
     */
    useEffect(() => {
        try {
            const badge = document.getElementById('admin-appointment-badge');
            if (badge) {
                const count = newRequests.length;
                badge.textContent = count;
                badge.style.display = count > 0 ? 'flex' : 'none';
            }
        } catch (e) {
            console.error("Failed to update admin appointment badge:", e);
        }
    }, [newRequests]); // (ทำงานใหม่เมื่อ newRequests เปลี่ยน)


    // --- Core Logic (Event Handlers) ---
    const createNotification = (patientId, type, message) => {
        const newNotification = {
            id: Date.now(), patientId: patientId, type: type,
            message: message, timestamp: new Date().toISOString(), read: false
        };
        const updatedNotifications = [newNotification, ...notifications];
        saveNotifications(updatedNotifications);
    };

    const updateRequestStatus = (id, newStatus, extraData = {}) => {
        const updatedRequests = requests.map(r => {
            if (r.id === id) {
                return { ...r, status: newStatus, ...extraData };
            }
            return r;
        });
        saveRequestsData(updatedRequests);
    };

    /**
     * (Handler: ส่งอีเมลแจ้งหมอ)
     * (อัปเดตล่าสุด)
     */
    const handleSendToDoctor = async (id) => {
        const request = requests.find(r => r.id === id);
        if (!request) { alert('ไม่พบคำขอ'); return; }

        setLoading(prev => ({ ...prev, [id]: true })); 

        const clinicName = request.clinic?.name || 'N/A';
        const symptoms = request.symptoms || 'ไม่มี';
        
        // (ค้นหาคนไข้)
        const patient = users.find(u => u.id === request.patient?.id);
        const patientProfile = patient ? patient.healthProfile : {}; // (ถ้าไม่เจอ ให้ใช้ object ว่าง)
        
        // (โค้ดสร้าง healthData)
        const healthData = `
ข้อมูลสุขภาพคนไข้:
- อายุ: ${patientProfile?.age || 'N/A'} ปี, เพศ: ${patientProfile?.gender || 'N/A'}
- ส่วนสูง/น้ำหนัก: ${patientProfile?.height || 'N/A'} ซม. / ${patientProfile?.weight || 'N/A'} กก.
- โรคประจำตัว: ${patientProfile?.conditions || 'ไม่มี'}
- แพ้ยา: ${patientProfile?.allergies || 'ไม่มี'}
        `;

        try {
            await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID_NOTIFY_DOCTOR, {
                // (ข้อมูลเดิม)
                email: request.doctor.email, 
                name: "แอดมิน Health Queue", 
                doctor_name: request.doctor.name,
                patient_name: request.patient.name, 
                appointment_date: request.date, 
                appointment_time: request.time,
                symptoms: symptoms,
                health_data: healthData,

                // 🔹 [FIX] 🔹 เพิ่ม 1 บรรทัดนี้
                patient_id: request.patient.id
            });
            
            alert('ส่งอีเมลแจ้งหมอ (พร้อมข้อมูลสุขภาพ) เรียบร้อยแล้ว');
            updateRequestStatus(id, 'approved');
        } catch (err) {
            alert('ส่งอีเมลแจ้งหมอล้มเหลว!');
            console.error(err);
        } finally {
            setLoading(prev => ({ ...prev, [id]: false }));
        }
    };

    const handleConfirmAppointment = (id) => {
        const request = requests.find(r => r.id === id);
        if (!request) return;
        if (window.confirm('คุณต้องการยืนยันนัดหมายนี้หรือไม่? (คนไข้จะได้รับการแจ้งเตือน)')) {
            const message = `นัดหมายของคุณกับ ${request.doctor.name} ในวันที่ ${request.date} ได้รับการ "ยืนยัน" แล้ว`;
            createNotification(request.patient.id, 'confirmed', message);
            updateRequestStatus(id, 'confirmed');
            alert('ยืนยันนัดหมายเรียบร้อยแล้ว');
        }
    };

    const handleRejectAppointment = (e, id) => {
        e.preventDefault();
        const request = requests.find(r => r.id === id);
        if (!request) return;
        const message = rejectionMessages[id] || "";
        if (!message.trim()) {
            alert('กรุณาพิมพ์เหตุผลในการปฏิเสธ');
            return;
        }
        if (window.confirm('คุณต้องการปฏิเสธนัดหมายนี้ใช่หรือไม่? (คนไข้จะได้รับการแจ้งเตือน)')) {
            const notifyMessage = `นัดหมายของคุณกับ ${request.doctor.name} ถูก "ปฏิเสธ" เนื่องจาก: ${message}`;
            createNotification(request.patient.id, 'rejected', notifyMessage);
            updateRequestStatus(id, 'rejected', { rejectionReason: message });
            alert('ปฏิเสธนัดหมายเรียบร้อยแล้ว');
        }
    };

    const handleRejectSpam = (id) => {
        if (window.confirm('คุณต้องการลบคำขอนี้ออกจากระบบ (สแปม) ใช่หรือไม่?')) {
            const updatedRequests = requests.filter(r => r.id !== id);
            saveRequestsData(updatedRequests);
            alert('ลบรายการสแปมเรียบร้อยแล้ว');
        }
    };
    
    const handleRejectionMessageChange = (id, value) => {
        setRejectionMessages(prev => ({ ...prev, [id]: value }));
    };

    // --- Render Functions ---

    // (View: หน้า Home หลัก)
    if (view === 'home') {
        return (
            // (Layout จะใส่ Header ให้)
            <div id="page-home" className="page active">
                <main className="container">
                    <nav className="admin-nav-grid">
                        <button className="admin-nav-btn" onClick={() => setView('new')}>
                            <span>📩</span>
                            <span>นัดหมายใหม่</span>
                            <span className="badge" id="new-count">{newRequests.length}</span>
                        </button>
                        <button className="admin-nav-btn" onClick={() => setView('approved')}>
                            <span>⏳</span>
                            <span>รอแจ้งผลคนไข้</span>
                            <span className="badge" id="approved-count">{approvedRequests.length}</span>
                        </button>
                    </nav>
                </main>
            </div>
        );
    }

    // (View: หน้านัดหมายใหม่)
    if (view === 'new') {
        return (
            // (Layout จะใส่ Header ให้)
            <div id="page-home-new" className="page active">
                <main className="container">
                    <a href="#" className="back-link" onClick={(e) => { e.preventDefault(); setView('home'); }}>
                        &larr; กลับหน้าหลัก
                    </a>
                    <h2 style={{marginTop: '0.5rem'}}>รายการนัดหมายใหม่</h2>
                    <div id="new-requests-list">
                        {newRequests.length === 0 ? (
                            <p className="text-center">ไม่มีรายการนัดหมายใหม่</p>
                        ) : (
                            newRequests.map(r => {
                                
                                // 🔹 [FIX START] 🔹
                                // 1. ค้นหาคนไข้
                                const patient = users.find(u => u.id === r.patient?.id);
                                
                                let healthInfoHtml;

                                if (patient) {
                                    // 2. ถ้าเจอ (เป็นคนไข้ปกติ)
                                    const patientProfile = patient.healthProfile || {};
                                    healthInfoHtml = (
                                        <>
                                            <p><strong>อายุ:</strong> {patientProfile.age || 'N/A'} ปี <strong>เพศ:</strong> {patientProfile.gender || 'N/A'}</p>
                                            <p><strong>น้ำหนัก:</strong> {patientProfile.weight || 'N/A'} กก. <strong>ส่วนสูง:</strong> {patientProfile.height || 'N/A'} ซม.</p>
                                            <p><strong>โรคประจำตัว:</strong> {patientProfile.conditions || 'ไม่มี'}</p>
                                            <p><strong>แพ้ยา:</strong> {patientProfile.allergies || 'ไม่มี'}</p>
                                        </>
                                    );
                                } else {
                                    // 3. ถ้าหาไม่เจอ (เช่น เป็น Admin หรือ User ที่ถูกลบ)
                                    healthInfoHtml = (
                                        <p style={{fontStyle: 'italic', color: '#777', margin: 0}}>
                                            ไม่พบข้อมูลสุขภาพในระบบ (User ID: {r.patient?.id})
                                        </p>
                                    );
                                }
                                // 🔹 [FIX END] 🔹

                                return (
                                    <div key={r.id} className="card admin-appointment-item">
                                        <div className="item-details">
                                            <p><strong>คนไข้:</strong> {r.patient?.name || 'N/A'} (ID: {r.patient?.id})</p>
                                            <p><strong>แพทย์:</strong> {r.doctor?.name || 'N/A'} ({r.clinic?.name || 'N/A'})</p>
                                            <p><strong>วัน-เวลา:</strong> {r.date || '-'} {r.time || ''}</p>
                                            
                                            {r.symptoms && (
                                                <div className="symptom-box">
                                                    <strong>อาการเบื้องต้น:</strong>
                                                    <p>{r.symptoms}</p>
                                                </div>
                                            )}
                                            
                                            <div className="patient-health-info">
                                                <strong>ข้อมูลสุขภาพ:</strong>
                                                
                                                {/* 4. แสดงผลลัพธ์จากตัวแปร */}
                                                {healthInfoHtml}

                                            </div>
                                        </div>
                                        <div className="admin-actions">
                                            <button 
                                                className="btn" 
                                                onClick={() => handleSendToDoctor(r.id)}
                                                disabled={loading[r.id]}
                                            >
                                                {loading[r.id] ? 'กำลังส่ง...' : 'ส่งอีเมลแจ้งหมอ »'}
                                            </button>
                                            <button className="btn btn-danger" onClick={() => handleRejectSpam(r.id)}>
                                                ปฏิเสธ (สแปม)
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </main>
            </div>
        );
    }

    // (View: หน้ารอแจ้งผล)
    if (view === 'approved') {
        return (
            // (Layout จะใส่ Header ให้)
            <div id="page-home-approved" className="page active">
                <main className="container">
                    <a href="#" className="back-link" onClick={(e) => { e.preventDefault(); setView('home'); }}>
                        &larr; กลับหน้าหลัก
                    </a>
                    <h2 style={{marginTop: '0.5rem'}}>รายการรอแจ้งผล</h2>
                    <div id="approved-requests-list">
                        {approvedRequests.length === 0 ? (
                            <p className="text-center">ไม่มีรายการรอแจ้งผล</p>
                        ) : (
                            approvedRequests.map(r => (
                                <div key={r.id} className="card admin-appointment-item" id={`request-card-${r.id}`}>
                                    <div className="item-details">
                                        <p><strong>คนไข้:</strong> {r.patient?.name || 'N/A'}</p>
                                        <p><strong>แพทย์:</strong> {r.doctor?.name || 'N/A'}</p>
                                        <p><strong>วัน-เวลา:</strong> {r.date || '-'} {r.time || ''}</p>
                                        <small style={{ color: 'var(--success-color)' }}><i>(ส่งอีเมลแจ้งหมอแล้ว)</i></small>
                                    </div>
                                    <div className="admin-actions-vertical">
                                        <button className="btn btn-success" onClick={() => handleConfirmAppointment(r.id)}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            ยืนยันนัดหมาย (แจ้งคนไข้)
                                        </button>
                                        <form className="rejection-form" onSubmit={(e) => handleRejectAppointment(e, r.id)}>
                                            <textarea 
                                                id={`rejection-msg-${r.id}`} 
                                                className="input" 
                                                placeholder="ปฏิเสธพร้อมเขียนคำแนะนำ/เหตุผล (จำเป็น)" 
                                                required
                                                value={rejectionMessages[r.id] || ''}
                                                onChange={(e) => handleRejectionMessageChange(r.id, e.target.value)}
                                            ></textarea>
                                            <button type="submit" className="btn btn-danger">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                ปฏิเสธนัดหมาย (แจ้งคนไข้)
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </main>
            </div>
        );
    }
    return null;
}

export default HomeAdmin;