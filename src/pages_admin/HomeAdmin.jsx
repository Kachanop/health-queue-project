import React, { useState, useEffect, useMemo } from 'react';
import emailjs from '@emailjs/browser';
// (CSS ถูก import ใน main.jsx แล้ว)

// (Config EmailJS)
const EMAILJS_CONFIG = {
    PUBLIC_KEY: "QWWAWjIdVvqW0oQSn",
    SERVICE_ID: "service_gbcxqzd",
    TEMPLATE_ID_NOTIFY_DOCTOR: "template_qje00uc" 
};

function HomeAdmin() {
    // --- State ---
    const [view, setView] = useState('home'); // 'home', 'new', 'history'
    const [requests, setRequests] = useState([]);
    const [users, setUsers] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState({});
    
    // State สำหรับข้อความ
    const [rejectionMessages, setRejectionMessages] = useState({});
    const [adminMessages, setAdminMessages] = useState({});

    // --- Data Loading ---
    useEffect(() => {
        const storedRequests = JSON.parse(localStorage.getItem('requests')) || [];
        const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
        const storedNotifications = JSON.parse(localStorage.getItem('notifications')) || [];
        
        setRequests(storedRequests);
        setUsers(storedUsers);
        setNotifications(storedNotifications);

        try {
            emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
        } catch (e) {
            console.error("EmailJS SDK init failed.", e);
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

    // 🔹 [ADDED] ดึงข้อมูลประวัติ (ยืนยันแล้ว / ปฏิเสธแล้ว) 🔹
    const historyRequests = useMemo(() => 
        requests.filter(r => r && (r.status === 'confirmed' || r.status === 'rejected'))
                .sort((a, b) => b.id - a.id) // เรียงล่าสุดก่อน
    , [requests]);

    // --- Badge Update ---
    useEffect(() => {
        try {
            const badge = document.getElementById('admin-appointment-badge');
            if (badge) {
                const count = newRequests.length;
                badge.textContent = count;
                badge.style.display = count > 0 ? 'flex' : 'none';
            }
        } catch (e) {
            console.error("Failed to update badge:", e);
        }
    }, [newRequests]);


    // --- Core Logic ---
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
            if (r.id === id) return { ...r, status: newStatus, ...extraData };
            return r;
        });
        saveRequestsData(updatedRequests);
    };

    // --- Handlers (Send Email / Confirm / Reject) ---

    const handleSendToDoctor = async (id) => {
        const request = requests.find(r => r.id === id);
        if (!request) { alert('ไม่พบคำขอ'); return; }

        setLoading(prev => ({ ...prev, [id]: true })); 

        const clinicName = request.clinic?.name || 'ไม่ระบุคลินิก';
        const packageName = request.package || 'นัดหมายทั่วไป';
        const symptoms = request.symptoms || 'ไม่มี';
        const patient = users.find(u => u.id === request.patient?.id);
        const targetEmail = request.patient?.email || patient?.email;
        const adminNote = adminMessages[id] || '-';

        if (!targetEmail) {
            alert('ไม่พบอีเมลของคนไข้!');
            setLoading(prev => ({ ...prev, [id]: false }));
            return;
        }

        try {
            const doctorName = request.selectedDoctor || request.doctor?.name || 'แพทย์ที่เลือก';
            
            await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID_NOTIFY_DOCTOR, {
                email: targetEmail, 
                status_text: "ยืนยันการนัดหมายเรียบร้อยแล้ว", 
                doctor_name: doctorName,
                clinic_name: clinicName,
                appointment_date: request.date, 
                appointment_time: request.time,
                package_name: packageName,
                symptoms: symptoms,
                patient_name: request.patient.name,
                admin_message: adminNote 
            });
            
            const message = `นัดหมายของคุณกับ ${doctorName} ได้รับการ "ยืนยัน" แล้ว (ดูรายละเอียดในอีเมล)`;
            createNotification(request.patient.id, 'confirmed', message);
            updateRequestStatus(id, 'confirmed');
            
            alert(`ยืนยันนัดหมายและส่งเมลให้คุณ ${request.patient.name} เรียบร้อยแล้ว`);

        } catch (err) {
            alert('ส่งอีเมลล้มเหลว! กรุณาตรวจสอบ Console');
            console.error(err);
        } finally {
            setLoading(prev => ({ ...prev, [id]: false }));
        }
    };

    const handleRejectSpam = (id) => {
        if (window.confirm('คุณต้องการลบคำขอนี้ออกจากระบบ (สแปม) ใช่หรือไม่?')) {
            const updatedRequests = requests.filter(r => r.id !== id);
            saveRequestsData(updatedRequests);
            alert('ลบรายการเรียบร้อยแล้ว');
        }
    };
    
    const handleRejectionMessageChange = (id, value) => {
        setRejectionMessages(prev => ({ ...prev, [id]: value }));
    };

    const handleAdminMessageChange = (id, value) => {
        setAdminMessages(prev => ({ ...prev, [id]: value }));
    };


    // --- Render Functions ---

    // 🔹 [UPDATED] หน้า Home เพิ่มปุ่มประวัติ 🔹
    if (view === 'home') {
        return (
            <div id="page-home" className="page active">
                <main className="container">
                    {/* เปลี่ยนเป็น Grid 2 คอลัมน์ เพื่อแสดงปุ่มคู่กัน */}
                    <nav className="admin-nav-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        
                        {/* ปุ่ม 1: แจ้งการนัดหมาย */}
                        <button className="admin-nav-btn" onClick={() => setView('new')} style={{ minHeight: '150px', backgroundColor: '#e3f2fd', borderColor: '#90caf9' }}>
                            <span style={{ fontSize: '3rem' }}>📩</span>
                            <span style={{ marginTop: '10px', fontSize: '1.1rem', color: '#1976d2' }}>แจ้งการนัดหมายคนไข้</span>
                            <span className="badge" id="new-count">{newRequests.length}</span>
                        </button>

                        {/* ปุ่ม 2: ประวัติทั้งหมด */}
                        <button className="admin-nav-btn" onClick={() => setView('history')} style={{ minHeight: '150px', backgroundColor: '#f5f5f5', borderColor: '#bdbdbd' }}>
                            <span style={{ fontSize: '3rem' }}>📜</span>
                            <span style={{ marginTop: '10px', fontSize: '1.1rem', color: '#616161' }}>ประวัติการนัดหมายทั้งหมด</span>
                            <span className="badge" style={{ backgroundColor: '#757575' }}>{historyRequests.length}</span>
                        </button>
                        
                    </nav>
                </main>
            </div>
        );
    }

    // (View: หน้านัดหมายใหม่ - เหมือนเดิม)
    if (view === 'new') {
        return (
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
                                const patient = users.find(u => u.id === r.patient?.id);
                                const patientEmail = r.patient?.email || patient?.email || 'ไม่ระบุ';
                                
                                let healthInfoHtml;
                                if (patient) {
                                    const p = patient.healthProfile || {};
                                    healthInfoHtml = (
                                        <div style={{ marginLeft: '0.5rem', color: '#555', fontSize: '0.9rem' }}>
                                            <div>อายุ: {p.age || '-'} ปี &nbsp;|&nbsp; เพศ: {p.gender || '-'}</div>
                                            <div>แพ้ยา: {p.allergies || '-'}</div>
                                            <div>โรคประจำตัว: {p.conditions || '-'}</div>
                                        </div>
                                    );
                                } else {
                                    healthInfoHtml = <p style={{fontStyle:'italic', color:'#777'}}>ไม่พบข้อมูลสุขภาพ</p>;
                                }

                                return (
                                    <div key={r.id} className="card admin-appointment-item" style={{ padding: '1.5rem' }}>
                                        <div className="item-details">
                                            <div style={{ marginBottom: '0.5rem' }}>
                                                <strong>คนไข้:</strong> {r.patient?.name || 'N/A'} (ID: {r.patient?.id}) <br/>
                                                <strong>อีเมล:</strong> <span style={{color: '#007bff'}}>{patientEmail}</span>
                                            </div>
                                            <div style={{ marginBottom: '0.5rem' }}>
                                                <strong>แพทย์:</strong> {r.selectedDoctor || r.doctor?.name || 'ไม่ระบุ'} ({r.clinic?.name}) <br/>
                                                <strong>วัน-เวลา:</strong> {r.date} {r.time}
                                            </div>
                                            <div style={{ marginTop: '1rem' }}>
                                                <strong>อาการ:</strong>
                                                <div style={{ background: '#f9f9f9', padding: '8px', borderRadius: '4px', marginTop: '4px' }}>
                                                    {r.symptoms || '-'}
                                                </div>
                                            </div>
                                            <div style={{ marginTop: '1rem' }}>
                                                <strong>ข้อมูลสุขภาพ:</strong>
                                                {healthInfoHtml}
                                            </div>
                                            <div style={{ marginTop: '1rem', borderTop: '1px dashed #ccc', paddingTop: '1rem' }}>
                                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#d63384' }}>
                                                    แจ้งรายละเอียดคนไข้:
                                                </label>
                                                <textarea 
                                                    className="input" 
                                                    placeholder="*admin สามารถเขียนได้*" 
                                                    rows="2"
                                                    value={adminMessages[r.id] || ''}
                                                    onChange={(e) => handleAdminMessageChange(r.id, e.target.value)}
                                                    style={{ width: '100%', fontSize: '0.9rem' }}
                                                ></textarea>
                                            </div>
                                        </div>
                                        <div className="admin-actions" style={{ marginTop: '1.5rem' }}>
                                            <button className="btn btn-success" onClick={() => handleSendToDoctor(r.id)} disabled={loading[r.id]}>
                                                {loading[r.id] ? 'กำลังส่ง...' : 'ส่งเมลยืนยันการนัดหมายให้คนไข้'}
                                            </button>
                                            <button className="btn btn-danger" onClick={() => handleRejectSpam(r.id)} style={{ marginTop: '0.5rem' }}>
                                                ลบ (สแปม)
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

    // 🔹 [ADDED] หน้า History (ประวัติทั้งหมด) 🔹
    if (view === 'history') {
        return (
            <div id="page-home-history" className="page active">
                <main className="container">
                    <a href="#" className="back-link" onClick={(e) => { e.preventDefault(); setView('home'); }}>
                        &larr; กลับหน้าหลัก
                    </a>
                    <h2 style={{marginTop: '0.5rem'}}>ประวัติการนัดหมายทั้งหมด</h2>
                    <div id="history-requests-list">
                        {historyRequests.length === 0 ? (
                            <p className="text-center">ไม่มีประวัติการนัดหมาย</p>
                        ) : (
                            historyRequests.map(r => {
                                const isConfirmed = r.status === 'confirmed';
                                const statusColor = isConfirmed ? '#28a745' : '#dc3545'; // เขียว / แดง
                                const statusText = isConfirmed ? 'ยืนยันแล้ว' : 'ถูกปฏิเสธ';
                                const patientEmail = r.patient?.email || 'ไม่ระบุ';

                                return (
                                    <div key={r.id} className="card" style={{ borderLeft: `5px solid ${statusColor}`, padding: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                            <div>
                                                <h4 style={{ margin: '0 0 0.5rem 0', color: statusColor }}>
                                                    {statusText}
                                                </h4>
                                                <p style={{ margin: '0.25rem 0' }}><strong>คนไข้:</strong> {r.patient?.name} <span style={{color:'#777'}}>({patientEmail})</span></p>
                                                <p style={{ margin: '0.25rem 0' }}><strong>แพทย์:</strong> {r.selectedDoctor || r.doctor?.name || 'ไม่ระบุ'}</p>
                                                <p style={{ margin: '0.25rem 0' }}><strong>วัน-เวลา:</strong> {r.date} {r.time}</p>
                                            </div>
                                            <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#999' }}>
                                                ID: {r.id}
                                            </div>
                                        </div>
                                        
                                        {/* ถ้าถูกปฏิเสธ ให้โชว์เหตุผล */}
                                        {!isConfirmed && r.rejectionReason && (
                                            <div style={{ marginTop: '1rem', background: '#fff5f5', padding: '0.5rem', borderRadius: '4px', border: '1px dashed #dc3545' }}>
                                                <strong style={{ color: '#dc3545' }}>เหตุผลที่ปฏิเสธ:</strong> {r.rejectionReason}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </main>
            </div>
        );
    }

    return null;
}

export default HomeAdmin;