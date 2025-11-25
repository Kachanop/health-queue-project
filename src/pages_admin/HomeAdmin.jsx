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
    
    // State สำหรับเลือกรอบนัดหมายที่จะอนุมัติ
    const [selectedAppointmentRounds, setSelectedAppointmentRounds] = useState({});

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

        // ดึงรอบนัดหมายที่ Admin เลือก (default = รอบแรก)
        const selectedRoundIndex = selectedAppointmentRounds[id] ?? 0;
        let appointmentDate = request.date;
        let appointmentTime = request.time;
        
        // ถ้ามี appointments array ให้ใช้รอบที่เลือก
        if (request.appointments && request.appointments.length > 0) {
            const selectedRound = request.appointments[selectedRoundIndex];
            if (selectedRound) {
                appointmentDate = selectedRound.date;
                appointmentTime = selectedRound.time;
            }
        }

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
                appointment_date: appointmentDate, 
                appointment_time: appointmentTime,
                package_name: packageName,
                symptoms: symptoms,
                patient_name: request.patient.name,
                admin_message: adminNote 
            });
            
            const message = `นัดหมายของคุณกับ ${doctorName} ได้รับการ "ยืนยัน" แล้ว วันที่ ${appointmentDate} เวลา ${appointmentTime} (ดูรายละเอียดในอีเมล)`;
            createNotification(request.patient.id, 'confirmed', message);
            
            // อัพเดท request ด้วยรอบที่เลือก
            updateRequestStatusWithRound(id, 'confirmed', appointmentDate, appointmentTime, selectedRoundIndex);
            
            alert(`ยืนยันนัดหมายและส่งเมลให้คุณ ${request.patient.name} เรียบร้อยแล้ว\nรอบที่เลือก: ${appointmentDate} เวลา ${appointmentTime}`);

        } catch (err) {
            alert('ส่งอีเมลล้มเหลว! กรุณาตรวจสอบ Console');
            console.error(err);
        } finally {
            setLoading(prev => ({ ...prev, [id]: false }));
        }
    };
    
    // อัพเดท status พร้อมรอบที่เลือก
    const updateRequestStatusWithRound = (id, newStatus, confirmedDate, confirmedTime, selectedRoundIndex) => {
        const updated = requests.map(r => {
            if (r.id === id) {
                return { 
                    ...r, 
                    status: newStatus,
                    date: confirmedDate,
                    time: confirmedTime,
                    confirmedRound: selectedRoundIndex + 1  // บันทึกว่าเลือกรอบไหน (1-indexed)
                };
            }
            return r;
        });
        saveRequestsData(updated);
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

    // แสดงรายการนัดหมายใหม่โดยตรง
    return (
        <div id="page-home-new" className="page active">
            <main className="container">
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
                                                <strong>แพทย์:</strong> {r.selectedDoctor || r.doctor?.name || 'ไม่ระบุ'} ({r.clinic?.name})
                                            </div>
                                            
                                            {/* แสดงรอบนัดหมายทั้งหมดให้ Admin เลือก */}
                                            {(() => {
                                                // ถ้าไม่มี appointments ให้สร้างจาก date/time เดิม
                                                const appointmentsList = (r.appointments && r.appointments.length > 0) 
                                                    ? r.appointments 
                                                    : (r.date && r.time ? [{ date: r.date, time: r.time }] : []);
                                                
                                                return appointmentsList.length > 0 ? (
                                                <div style={{ 
                                                    marginTop: '1rem',
                                                    padding: '1rem',
                                                    backgroundColor: '#f0f9ff',
                                                    borderRadius: '12px',
                                                    border: '2px solid #3b82f6'
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        fontSize: '0.95rem',
                                                        color: '#1e40af',
                                                        fontWeight: '700',
                                                        marginBottom: '0.75rem',
                                                        paddingBottom: '0.5rem',
                                                        borderBottom: '1px solid #bfdbfe'
                                                    }}>
                                                        <span>📅</span>
                                                        {appointmentsList.length > 1 ? 'รอบนัดหมายที่คนไข้เลือกมา (เลือกรอบที่จะอนุมัติ)' : 'วัน-เวลานัดหมาย'}
                                                    </div>
                                                    {appointmentsList.map((apt, index) => (
                                                        apt.date && apt.time && (
                                                            <div 
                                                                key={index} 
                                                                onClick={() => setSelectedAppointmentRounds(prev => ({...prev, [r.id]: index}))}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '0.75rem',
                                                                    padding: '0.75rem',
                                                                    backgroundColor: (selectedAppointmentRounds[r.id] ?? 0) === index ? '#dbeafe' : '#fff',
                                                                    borderRadius: '8px',
                                                                    marginBottom: index < appointmentsList.length - 1 ? '0.5rem' : 0,
                                                                    border: (selectedAppointmentRounds[r.id] ?? 0) === index ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                                                                    cursor: appointmentsList.length > 1 ? 'pointer' : 'default',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                            >
                                                                {appointmentsList.length > 1 && (
                                                                    <input 
                                                                        type="radio" 
                                                                        name={`appointment-round-${r.id}`}
                                                                        checked={(selectedAppointmentRounds[r.id] ?? 0) === index}
                                                                        onChange={() => setSelectedAppointmentRounds(prev => ({...prev, [r.id]: index}))}
                                                                        style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }}
                                                                    />
                                                                )}
                                                                <span style={{
                                                                    backgroundColor: index === 0 ? '#1e40af' : index === 1 ? '#3b82f6' : '#60a5fa',
                                                                    color: 'white',
                                                                    padding: '0.3rem 0.6rem',
                                                                    borderRadius: '6px',
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: '700',
                                                                    minWidth: '55px',
                                                                    textAlign: 'center'
                                                                }}>
                                                                    {appointmentsList.length > 1 ? `รอบ ${index + 1}${index === 0 ? ' ★' : ''}` : '📅'}
                                                                </span>
                                                                <div style={{flex: 1}}>
                                                                    <div style={{fontSize: '0.9rem', color: '#1e293b', fontWeight: '600'}}>
                                                                        {apt.date}
                                                                    </div>
                                                                    <div style={{fontSize: '0.8rem', color: '#3b82f6', fontWeight: '500'}}>
                                                                        ⏰ เวลา {apt.time}
                                                                    </div>
                                                                </div>
                                                                {appointmentsList.length > 1 && index === 0 && (
                                                                    <span style={{
                                                                        backgroundColor: '#fef3c7',
                                                                        color: '#d97706',
                                                                        padding: '0.2rem 0.4rem',
                                                                        borderRadius: '4px',
                                                                        fontSize: '0.65rem',
                                                                        fontWeight: '600'
                                                                    }}>
                                                                        ตัวเลือกหลัก
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )
                                                    ))}
                                                </div>
                                            ) : (
                                                <div style={{ marginBottom: '0.5rem' }}>
                                                    <strong>วัน-เวลา:</strong> ไม่ระบุ
                                                </div>
                                            );
                                            })()}
                                            
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

export default HomeAdmin;