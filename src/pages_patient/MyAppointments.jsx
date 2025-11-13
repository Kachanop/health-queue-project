import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// (CSS ถูก import ใน main.jsx แล้ว)

// (Component: Modal รายละเอียด)
function AppointmentDetailModal({ appointment, user, isOpen, onClose }) {
    if (!isOpen || !appointment || !user) return null;

    const profile = user.healthProfile || {};
    const a = appointment; 

    let statusHtml = '';
    if (a.status === 'confirmed') {
        statusHtml = <h3 style={{ color: 'var(--success-color)' }}>สถานะ: ยืนยันแล้ว</h3>;
    } else if (a.status === 'rejected') {
        statusHtml = <h3 style={{ color: 'var(--danger-color)' }}>สถานะ: ถูกปฏิเสธ</h3>;
    } else {
        statusHtml = <h3 style={{ color: 'var(--secondary-color)' }}>สถานะ: รอดำเนินการ</h3>;
    }

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            id="appointment-detail-modal" 
            className="modal-overlay active"
            onClick={handleBackdropClick}
        >
            <div className="modal-content">
                <button id="close-appointment-modal-btn" className="modal-close-btn" onClick={onClose}>&times;</button>
                <div id="appointment-detail-content">
                    {statusHtml}
                    <hr />
                    <h4>ข้อมูลการนัดหมาย</h4>
                    <p><strong>แพทย์:</strong> {a.doctor?.name}</p>
                    <p><strong>คลินิก:</strong> {a.clinic?.name}</p>
                    <p><strong>วัน-เวลา:</strong> {a.date} เวลา {a.time} น.</p>
                    <p><strong>แพ็กเกจ/รายการ:</strong> {a.package}</p>
                    
                    {a.symptoms && (
                        <div className="symptom-box" style={{ marginTop: '1rem' }}>
                            <strong>อาการเบื้องต้นที่แจ้ง:</strong>
                            <p>{a.symptoms}</p>
                        </div>
                    )}
                    
                    {a.status === 'rejected' && (
                        <div className="rejection-reason" style={{ marginTop: '1rem' }}>
                            <strong>เหตุผลจากแอดมิน:</strong>
                            <p>{a.rejectionReason}</p>
                        </div>
                    )}

                    {a.status === 'confirmed' && (
                        <div className="patient-health-info" style={{ marginTop: '1rem', backgroundColor: '#f6ffed', borderColor: '#b7eb8f' }}>
                            <strong style={{ color: '#389e0d' }}>คำแนะนำ:</strong>
                            <p>กรุณามาถึงโรงพยาบาลก่อนเวลานัด 15 นาที</p>
                        </div>
                    )}
                    
                    <hr />
                    <h4>ข้อมูลสุขภาพของคุณ (ณ วันที่จอง)</h4>
                    <p><strong>อายุ/เพศ:</strong> {profile.age || 'N/A'} ปี / {profile.gender || 'N/A'}</p>
                    <p><strong>ส่วนสูง/น้ำหนัก:</strong> {profile.height || 'N/A'} ซม. / {profile.weight || 'N/A'} กก.</p>
                    <p><strong>โรคประจำตัว:</strong> {profile.conditions || 'ไม่มี'}</p>
                    <p><strong>แพ้ยา:</strong> {profile.allergies || 'ไม่มี'}</p>
                </div>
            </div>
        </div>
    );
}

// (Component: หน้าหลักนัดหมาย)
function MyAppointments() {
    // --- State ---
    const [allRequests, setAllRequests] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    // (เราไม่ต้องการ useNavigate ที่นี่แล้ว เพราะ ProtectedRoute จัดการ)

    // --- Effect (เมื่อคอมโพเนนต์โหลด) ---
    useEffect(() => {
        // (หน้านี้ถูก ProtectedRoute คุ้มครองอยู่แล้ว)
        const user = JSON.parse(sessionStorage.getItem('currentUser'));
        setCurrentUser(user); 
        
        // (อ่าน DB จาก localStorage)
        const requests = JSON.parse(localStorage.getItem('requests')) || [];
        setAllRequests(requests);
    }, []); // (ทำงานแค่ครั้งเดียว)

    // --- Memoized Data (กรองข้อมูล) ---
    const myAppointments = useMemo(() => {
        if (!currentUser) return [];
        return allRequests
            .filter(r => r.patient?.id === currentUser.id)
            .sort((a, b) => b.id - a.id); // (เรียงล่าสุดอยู่บน)
    }, [allRequests, currentUser]);

    const upcomingAppointments = useMemo(() => 
        myAppointments.filter(a => a.status === 'new' || a.status === 'approved')
    , [myAppointments]);
    
    const historyAppointments = useMemo(() => 
        myAppointments.filter(a => a.status === 'confirmed' || a.status === 'rejected')
    , [myAppointments]);

    // --- Handlers ---
    const handleViewDetail = (id) => {
        const appointment = allRequests.find(r => r.id === id);
        if (appointment) {
            setSelectedAppointment(appointment);
            setIsModalOpen(true);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedAppointment(null);
    };

    const renderCard = (a) => {
        let statusHtml = '';
        let cardClass = '';

        switch(a.status) {
            case 'confirmed':
                cardClass = 'status-confirmed';
                statusHtml = <h3><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> ยืนยันแล้ว</h3>;
                break;
            case 'rejected':
                cardClass = 'status-rejected';
                statusHtml = <h3><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> ถูกปฏิเสธ</h3>;
                break;
            default: // 'new' or 'approved'
                cardClass = 'status-pending';
                statusHtml = <h3><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> รอดำเนินการ</h3>;
                break;
        }

        return (
            <div 
                key={a.id} 
                className={`card appointment-card ${cardClass}`} 
                onClick={() => handleViewDetail(a.id)}
                style={{cursor: 'pointer'}}
            >
                {statusHtml}
                <p><strong>แพทย์:</strong> {a.doctor?.name || 'N/A'}</p>
                <p><strong>คลินิก:</strong> {a.clinic?.name || 'N/A'}</p>
                <p><strong>วัน-เวลา:</strong> {a.date} เวลา {a.time} น.</p>
                {a.status === 'rejected' && (
                    <p><strong>เหตุผล:</strong> {a.rejectionReason.substring(0, 50)}...</p>
                )}
            </div>
        );
    };

    // --- Render ---
    return (
        <>
            {/* (Layout จะใส่ Header ให้) */}
            <div id="page-myappointments" className="page active">
                <main className="container" id="appointments-list">
                    {myAppointments.length === 0 ? (
                        <p className="text-center">คุณยังไม่มีรายการนัดหมาย</p>
                    ) : (
                        <>
                            {upcomingAppointments.length > 0 && (
                                <>
                                    <h3 className="appointment-list-header">นัดหมายที่รอดำเนินการ</h3>
                                    {upcomingAppointments.map(renderCard)}
                                </>
                            )}
                            
                            {historyAppointments.length > 0 && (
                                <>
                                    <h3 className="appointment-list-header">ประวัติการนัดหมาย</h3>
                                    {upcomingAppointments.length > 0 && <div className="appointment-divider"></div>}
                                    {historyAppointments.map(renderCard)}
                                </>
                            )}
                        </>
                    )}
                </main>
            </div>
            
            <AppointmentDetailModal 
                appointment={selectedAppointment}
                user={currentUser}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </>
    );
}

export default MyAppointments;