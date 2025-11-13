import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// (CSS ถูก import ใน main.jsx แล้ว)

// (ฟังก์ชันสำหรับโหลด/สร้างข้อมูลคลินิกจำลอง)
function loadClinicData() {
    let storedClinics = JSON.parse(localStorage.getItem('clinicsData'));
    if (!storedClinics || storedClinics.length === 0) {
        console.warn("Home.jsx: No 'clinicsData' found. Seeding with initial data.");
        const initialClinics = [
            { 
                id: 1, 
                name: "โรงพยาบาลสมิติเวช สุขุมวิท", 
                image: "https://www.samitivejhospitals.com/wp-content/uploads/2022/07/Samitivej-Sukhumvit-Hospital-1.jpg", 
                doctors: [
                    { id: 101, name: "นพ. สมชาย ใจดี", specialty: "อายุรศาสตร์", email: "ponahcak@gmail.com" },
                    { 
                        id: 102, name: "พญ. สุภาภรณ์ เก่งมาก", specialty: "กุมารเวชศาสตร์", 
                        packages: [
                            { id: 1, name: "ตรวจสุขภาพเด็ก", price: 1500, note: "สำหรับเด็กอายุ 1-5 ปี" },
                            { id: 2, name: "ฉีดวัคซีนรวม", price: 2200, note: "รวมวัคซีนพื้นฐาน" }
                        ], 
                        email: "ponahcak@gmail.com"
                    }
                ]
            },
            { 
                id: 2, 
                name: "โรงพยาบาลกรุงเทพ", 
                image: "https://www.bangkokhospital.com/storage/page/content/sub-page-widget/bht-building_1666685714.jpg", 
                doctors: [
                    { 
                        id: 301, name: "นพ. ชาญชัย ชนะโรค", specialty: "อายุรศาสตร์โรคหัวใจ", 
                        packages: [
                            { id: 1, name: "ตรวจคลื่นหัวใจ (EKG)", price: 900, note: "ตรวจการทำงานไฟฟ้าของหัวใจ" },
                            { id: 2, name: "วิ่งสายพาน (EST)", price: 3500, note: "ตรวจสมรรภาพหัวใจขณะออกกำลังกาย" }
                        ], 
                        email: "ponahcak@gmail.com"
                    }
                ]
            }
        ];
        localStorage.setItem('clinicsData', JSON.stringify(initialClinics));
        return initialClinics;
    } else {
        return storedClinics;
    }
}

function Home() {
    // --- State ---
    const [clinicsData, setClinicsData] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    // --- Effect (เมื่อคอมโพเนนต์โหลด หรือ URL เปลี่ยน) ---
    useEffect(() => {
        // (อ่าน sessionStorage ใหม่ทุกครั้งที่หน้านี้ทำงาน)
        const user = JSON.parse(sessionStorage.getItem('currentUser'));
        if (user) {
            setCurrentUser(user);
        } else {
            setCurrentUser(null); // (เคลียร์ state ถ้าไม่มี user)
        }
        
        const data = loadClinicData();
        setClinicsData(data);
        
    // (ให้ Effect ทำงานใหม่ทุกครั้งที่ pathname เปลี่ยน)
    }, [location.pathname]); 

    // --- Handlers ---
    const handleSelectClinic = (id) => {
        localStorage.setItem('selectedClinicId', id);
        navigate('/patient/clinic-detail'); 
    };
    
    const welcomeName = currentUser ? currentUser.name : 'คุณผู้ใช้';

    // --- Render ---
    return (
        // (Layout จะใส่ Header ให้)
        <div id="page-home" className="page active">
            <main className="container">
                <h2 style={{marginTop: 0, marginBottom: '0.5rem'}}>
                    สวัสดี, {welcomeName}
                </h2>
                <h3 style={{marginTop: 0}}>เลือกโรงพยาบาล / คลินิก</h3>
                <div id="clinic-list" className="grid cols-2">
                    {clinicsData.length === 0 ? (
                        <p className="text-center">ยังไม่มีคลินิกในระบบ</p>
                    ) : (
                        clinicsData.map(c => (
                            <div 
                                key={c.id} 
                                className="card card-clinic" 
                                onClick={() => handleSelectClinic(c.id)}
                                style={{padding: '0.5rem', cursor: 'pointer'}}
                            >
                                <img 
                                    src={c.image} 
                                    alt={c.name} 
                                    onError={(e) => e.target.src='https://placehold.co/600x400/eeeeee/cccccc?text=No+Image'} 
                                    style={{width: '100%', borderRadius: '8px', aspectRatio: '16/10', objectFit: 'cover'}}
                                />
                                <div className="card-content" style={{padding: '0.5rem 0.25rem'}}>
                                    <h3 style={{margin: '0.25rem 0', fontSize: '1rem'}}>{c.name}</h3>
                                    <p style={{margin: 0, fontSize: '0.9rem', color: '#555'}}>{c.doctors?.length || 0} แพทย์</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}

export default Home;