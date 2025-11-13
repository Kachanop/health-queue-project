import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import emailjs from '@emailjs/browser';
// (CSS ถูก import ใน main.jsx แล้ว)

// (Config EmailJS)
const EMAILJS_CONFIG = {
    PUBLIC_KEY: "QWWAWjIdVvqW0oQSn",
    SERVICE_ID: "service_bp7mvo8",
    TEMPLATE_ID_AUTO_REPLY: "template_gqj3s6f" // (ID สำหรับ Auto-Reply หาคนไข้)
};

function ClinicDetail() {
    // --- State ---
    const navigate = useNavigate();
    const location = useLocation(); // (สำหรับจำหน้า และบังคับ re-run effect)

    const [clinicsData, setClinicsData] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedClinicId, setSelectedClinicId] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(null); 
    const [formData, setFormData] = useState({
        pkg: '', symptoms: '', date: '', time: ''
    });

    // --- Effect (เมื่อคอมโพเนนต์โหลด หรือ URL เปลี่ยน) ---
    useEffect(() => {
        
        // (อ่าน sessionStorage ใหม่ทุกครั้งที่หน้านี้ทำงาน)
        const user = JSON.parse(sessionStorage.getItem('currentUser'));
        if (user) {
            setCurrentUser(user);
        } else {
            setCurrentUser(null); // (เคลียร์ state ถ้าไม่มี user)
        }

        const clinics = JSON.parse(localStorage.getItem('clinicsData')) || [];
        const clinicId = localStorage.getItem('selectedClinicId');
        
        // (ถ้าไม่มี clinicId (เช่น เข้าหน้านี้ตรงๆ) ให้เด้งกลับ)
        if (!clinicId) {
            navigate('/patient/home'); 
            return;
        }

        setClinicsData(clinics);
        setSelectedClinicId(clinicId);
        
        try {
            emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
        } catch (e) {
            console.error("EmailJS SDK (ClinicDetail.jsx) init failed.", e);
        }

    // (ให้ Effect ทำงานใหม่ทุกครั้งที่ pathname เปลี่ยน)
    }, [location.pathname, navigate]); 

    // --- Memoized Data ---
    const clinic = useMemo(() => {
        if (!selectedClinicId) return null;
        return clinicsData.find(c => c.id == selectedClinicId);
    }, [clinicsData, selectedClinicId]);

    // --- Handlers ---
    const handleSelectDoctor = (doctor) => {
        setSelectedDoctor(doctor);
        
        const defaultPackage = doctor.packages && doctor.packages.length > 0 
            ? doctor.packages[0].name 
            : 'นัดหมายทั่วไป';
            
        setFormData({
            pkg: defaultPackage,
            symptoms: '',
            date: '',
            time: ''
        });
        
        window.scrollTo(0, 0); // เลื่อนขึ้นบน
    };

    const handleBackToList = () => {
        setSelectedDoctor(null);
    };

    const handleFormChange = (e) => {
        const { id, value, name } = e.target;
        
        if (name === 'package') {
            setFormData(prev => ({ ...prev, pkg: value }));
        } else {
            const key = id.replace('appointment-', ''); 
            setFormData(prev => ({ ...prev, [key]: value }));
        }
    };

    /**
     * (Handler: กดจองนัดหมาย)
     * (อัปเดตล่าสุด)
     */
    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        
        // (Check 1: ต้องล็อกอินก่อน - อ่านจาก State)
        if (!currentUser) {
            alert('กรุณาล็อกอินก่อนทำการจองนัดหมาย');
            navigate('/login', { state: { from: location } }); 
            return;
        }

        // (Check 2: ต้องไม่ใช่ Admin - อ่านจาก State)
        if (currentUser.role === 'admin') {
            alert('แอดมินไม่สามารถจองนัดหมายได้ กรุณาล็อกอินด้วยบัญชีคนไข้');
            return;
        }

        if (!clinic || !selectedDoctor) {
            alert('เกิดข้อผิดพลาด: ไม่พบข้อมูลการจอง');
            navigate('/patient/home');
            return;
        }

        const newRequest = { 
            id: Date.now(), 
            status: "new",
            patient: { id: currentUser.id, name: currentUser.name, email: currentUser.email },
            clinic: { id: clinic.id, name: clinic.name },
            doctor: { id: selectedDoctor.id, name: selectedDoctor.name, email: selectedDoctor.email },
            package: formData.pkg,
            date: formData.date,
            time: formData.time,
            symptoms: formData.symptoms
        };
        
        
        // 🔹 [FIX START] 🔹
        // 1. ดึงข้อมูลสุขภาพจาก currentUser (ที่อยู่ใน State)
        const profile = currentUser.healthProfile || {};
        
        // 2. สร้าง String ข้อมูลสุขภาพ (ใช้ \n สำหรับ <pre>)
        const healthDataString = 
`อายุ: ${profile.age || 'N/A'} ปี, เพศ: ${profile.gender || 'N/A'}
น้ำหนัก: ${profile.weight || 'N/A'} กก., ส่วนสูง: ${profile.height || 'N/A'} ซม.
โรคประจำตัว: ${profile.conditions || 'ไม่มี'}
แพ้ยา: ${profile.allergies || 'ไม่มี'}`;
        // 🔹 [FIX END] 🔹


        // 1. ส่งอีเมล Auto-reply (EmailJS)
        try {
            // 🔹 [FIX 3] 🔹 เพิ่มตัวแปร 3 ตัวล่างนี้เข้าไป
            await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID_AUTO_REPLY, {
                // (ข้อมูลเดิม)
                patient_name: newRequest.patient.name,
                patient_email: newRequest.patient.email,
                doctor_name: newRequest.doctor.name,
                appointment_date: newRequest.date,
                appointment_time: newRequest.time,
                
                // (ข้อมูลใหม่ที่เพิ่ม)
                patient_id: newRequest.patient.id,
                symptoms: newRequest.symptoms || 'ไม่ได้ระบุอาการ',
                health_data: healthDataString
            });
            console.log("ส่งอีเมล Auto-reply สำเร็จ!");
        } catch (err) {
            console.error("ส่งอีเมล Auto-reply ล้มเหลว:", err);
        }
        
        // 2. บันทึกคำขอลง LocalStorage (ฐานข้อมูลกลาง)
        const requests = JSON.parse(localStorage.getItem('requests')) || [];
        requests.push(newRequest);
        localStorage.setItem('requests', JSON.stringify(requests));
        
        alert("ส่งคำขอจองนัดเรียบร้อยแล้ว! กรุณาตรวจสอบสถานะที่หน้านัดหมายของฉัน");
        
        // 3. ไปยังหน้านัดหมาย
        navigate('/patient/appointments');
    };

    // --- Loading State ---
    if (!clinic) {
        return <div className="page active"><main className="container"><p>กำลังโหลดข้อมูลคลินิก...</p></main></div>;
    }

    // --- Render Logic ---

    // (View 1: ถ้ายังไม่เลือกแพทย์ -> แสดงรายชื่อแพทย์)
    if (!selectedDoctor) {
        return (
            // (Layout จะใส่ Header ให้)
            <div id="page-clinic" className="page active">
                <main className="container">
                    <div id="doctor-list" className="grid cols-2">
                        {!clinic.doctors || clinic.doctors.length === 0 ? (
                            <p className="text-center">ยังไม่มีแพทย์ในคลินิกนี้</p>
                        ) : (
                            clinic.doctors.map(d => (
                                <div 
                                    key={d.id}
                                    className="card card-doctor" 
                                    onClick={() => handleSelectDoctor(d)}
                                    style={{cursor: 'pointer'}}
                                >
                                    <h4>{d.name}</h4>
                                    <p><strong>แผนก:</strong> {d.specialty}</p>
                                    <button className="btn" style={{width: 'auto', padding: '0.5rem 1rem'}}>จองนัด</button>
                                </div>
                            ))
                        )}
                    </div>
                </main>
            </div>
        );
    }
    
    // (View 2: ถ้าเลือกแพทย์แล้ว -> แสดงฟอร์มจอง)
    const doctor = selectedDoctor;
    
    return (
        // (Layout จะใส่ Header ให้)
        <div id="page-doctor" className="page active">
            <main className="container">
                {/* (ปุ่ม Back ใน Header ของ Layout จะทำงานอัตโนมัติ) */}
                <div className="grid cols-2" style={{alignItems: 'start'}}>
                    <div id="doctor-info" className="card">
                        <h3>{doctor.name}</h3>
                        <p><strong>แผนก:</strong> {doctor.specialty}</p>
                        <p><strong>โรงพยาบาล:</strong> {clinic.name}</p>
                    </div>
                    <div className="card">
                        <h3>กรอกรายละเอียดการนัดหมาย</h3>
                        <form id="booking-form" onSubmit={handleBookingSubmit}>
                            <div id="booking-options">
                                {doctor.packages && doctor.packages.length > 0 ? (
                                    <>
                                        <h4>เลือกแพ็กเกจ (ถ้ามี)</h4>
                                        {doctor.packages.map((p, index) => (
                                            <div key={p.id} className="package-option">
                                                <input 
                                                    type="radio" 
                                                    name="package" 
                                                    id={`pkg-${p.id}`} 
                                                    value={p.name} 
                                                    checked={formData.pkg === p.name}
                                                    onChange={handleFormChange}
                                                /> 
                                                <label htmlFor={`pkg-${p.id}`} style={{marginLeft: '0.5rem'}}>
                                                    {p.name} - {p.price} บาท
                                                    <br/><small style={{marginLeft: '1.5rem'}}>{p.note}</small>
                                                </label>
                                            </div>
                                        ))}
                                        <div className="package-option">
                                            <input 
                                                type="radio" 
                                                name="package" 
                                                id="pkg-general" 
                                                value="นัดหมายทั่วไป"
                                                checked={formData.pkg === 'นัดหมายทั่วไป'}
                                                onChange={handleFormChange}
                                            />
                                            <label htmlFor="pkg-general" style={{marginLeft: '0.5rem'}}>นัดหมายทั่วไป</label>
                                        </div>
                                    </>
                                ) : (
                                    <input type="hidden" name="package" value="นัดหมายทั่วไป" />
                                )}
                            </div>
                            
                            <div className="input-group">
                                <label htmlFor="appointment-symptoms">อาการเบื้องต้น (ไม่บังคับ)</label>
                                <textarea 
                                    id="appointment-symptoms" 
                                    className="input" 
                                    rows="4" 
                                    placeholder="เช่น มีไข้, ไอ, ปวดท้อง..."
                                    value={formData.symptoms}
                                    onChange={handleFormChange}
                                ></textarea>
                            </div>
                            <div className="input-group">
                                <label htmlFor="appointment-date">เลือกวันที่</label>
                                <input 
                                    type="date" 
                                    id="appointment-date" 
                                    className="input" 
                                    required
                                    min={new Date().toISOString().split("T")[0]} // (กันจองย้อนหลัง)
                                    value={formData.date}
                                    onChange={handleFormChange}
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="appointment-time">เลือกเวลา</label>
                                <input 
                                    type="time" 
                                    id="appointment-time" 
                                    className="input" 
                                    required
                                    value={formData.time}
                                    onChange={handleFormChange}
                                />
                            </div>
                            <button type="submit" className="btn">ยืนยันการจอง</button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ClinicDetail;