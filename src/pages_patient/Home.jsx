import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ฟังก์ชันสำหรับโหลด/สร้างข้อมูลคลินิกจำลอง
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

// --- Icon Components ---
const SearchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

function Home() {
    // --- State ---
    const [clinicsData, setClinicsData] = useState([]);
    const [filteredClinics, setFilteredClinics] = useState([]); // State สำหรับผลลัพธ์การค้นหา
    const [searchTerm, setSearchTerm] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    // --- Effect ---
    useEffect(() => {
        const user = JSON.parse(sessionStorage.getItem('currentUser'));
        if (user) {
            setCurrentUser(user);
        } else {
            setCurrentUser(null);
        }
        
        const data = loadClinicData();
        setClinicsData(data);
        setFilteredClinics(data); // เริ่มต้นให้แสดงทั้งหมด
        
    }, [location.pathname]); 

    // --- Search Logic ---
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredClinics(clinicsData);
        } else {
            const lowerTerm = searchTerm.toLowerCase();
            const results = clinicsData.filter(clinic => {
                // 1. ค้นหาจากชื่อคลินิก
                if (clinic.name.toLowerCase().includes(lowerTerm)) return true;
                
                // 2. ค้นหาจากชื่อหมอ หรือ ความเชี่ยวชาญ (อาการ)
                if (clinic.doctors && clinic.doctors.some(doc => 
                    doc.name.toLowerCase().includes(lowerTerm) || 
                    doc.specialty.toLowerCase().includes(lowerTerm)
                )) return true;

                return false;
            });
            setFilteredClinics(results);
        }
    }, [searchTerm, clinicsData]);

    // --- Handlers ---
    const handleSelectClinic = (id) => {
        localStorage.setItem('selectedClinicId', id);
        navigate('/patient/clinic-detail'); 
    };
    
    const welcomeName = currentUser ? currentUser.name : 'คุณผู้ใช้';

    // --- Styles ---
    const pageStyle = {
        position: 'relative',
        width: '100%',
        maxWidth: '1440px',
        minHeight: '1524px',
        background: '#FFFFFF',
        margin: '0 auto',
        paddingTop: '20px',
        boxSizing: 'border-box'
    };

    const heroSectionStyle = {
        display: 'flex',
        flexWrap: 'wrap', // ให้ย่อเป็นแนวตั้งได้ถ้าจอเล็ก
        gap: '40px',
        alignItems: 'center',
        marginBottom: '40px',
        marginTop: '20px'
    };

    const searchBoxStyle = {
        backgroundColor: '#AEE2F3', // สีฟ้าตามแบบ
        padding: '30px',
        borderRadius: '20px',
        boxShadow: '0 4px 15px rgba(174, 226, 243, 0.4)'
    };

    return (
        <div id="page-home" className="page active" style={pageStyle}>
            <main className="container" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                
                {/* --- Hero Section (ตามรูปภาพที่ขอ) --- */}
                <div style={heroSectionStyle}>
                    {/* Left Side: Text & Search */}
                    <div style={{ flex: '1 1 400px' }}>
                        <h1 style={{ fontSize: '32px', color: '#333', marginBottom: '25px', lineHeight: '1.2' }}>
                            นัดหมอ ออนไลน์ไม่ต้องรอนาน
                        </h1>
                        
                        <div style={searchBoxStyle}>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                <div style={{ 
                                    flex: 1, 
                                    position: 'relative', 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    backgroundColor: 'white',
                                    borderRadius: '10px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{ paddingLeft: '15px', display: 'flex' }}>
                                        <SearchIcon />
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="ชื่อหมอ , อาการ, ..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px 15px',
                                            border: 'none',
                                            outline: 'none',
                                            fontSize: '16px'
                                        }}
                                    />
                                </div>
                                <button style={{
                                    backgroundColor: 'black',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: '0 25px',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}>
                                    ค้นหา
                                </button>
                            </div>
                            <p style={{ fontSize: '14px', color: '#333', lineHeight: '1.6', margin: 0 }}>
                                พิมพ์ชื่อหมอหรืออาการต่างๆที่คุณต้องการค้นหาในช่องค้นหา
                                เราจะแนะนำหมอที่เชี่ยวชาญในด้านนั้นๆ ให้กับคุณเลือกดูหรือปรึกษาได้ตรงความต้องการ
                            </p>
                        </div>
                    </div>

                    {/* Right Side: Image */}
                    <div style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center' }}>
                        <img 
                            src="https://img.freepik.com/free-photo/team-young-specialist-doctors-standing-corridor-hospital_1303-21199.jpg" 
                            alt="Doctors Team"
                            style={{ 
                                width: '100%', 
                                maxWidth: '500px', 
                                height: '300px', 
                                objectFit: 'cover', 
                                borderRadius: '20px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                            }}
                        />
                    </div>
                </div>
                {/* ----------------------------------- */}

                <div style={{ marginBottom: '30px' }}>
                    <h2 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '24px', color: '#333' }}>
                        สวัสดี, {welcomeName}
                    </h2>
                    <h3 style={{ marginTop: 0, color: '#666', fontWeight: 'normal' }}>
                        {searchTerm ? 'ผลลัพธ์การค้นหา:' : 'เลือกโรงพยาบาล / คลินิกที่คุณต้องการเข้ารับบริการ'}
                    </h3>
                </div>

                <div id="clinic-list" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                    gap: '25px' 
                }}>
                    {filteredClinics.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: '#888', background: '#f9f9f9', borderRadius: '10px' }}>
                            <p style={{fontSize: '18px'}}>ไม่พบข้อมูลที่ค้นหา</p>
                            <p style={{fontSize: '14px'}}>ลองค้นหาด้วยคำอื่น เช่น "อายุรศาสตร์" หรือ "ตรวจสุขภาพ"</p>
                        </div>
                    ) : (
                        filteredClinics.map(c => (
                            <div 
                                key={c.id} 
                                className="card card-clinic" 
                                onClick={() => handleSelectClinic(c.id)}
                                style={{
                                    cursor: 'pointer',
                                    border: '1px solid #eee',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    background: '#fff'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                                }}
                            >
                                <div style={{ overflow: 'hidden', height: '200px' }}>
                                    <img 
                                        src={c.image} 
                                        alt={c.name} 
                                        onError={(e) => e.target.src='https://placehold.co/600x400/eeeeee/cccccc?text=No+Image'} 
                                        style={{
                                            width: '100%', 
                                            height: '100%', 
                                            objectFit: 'cover'
                                        }}
                                    />
                                </div>
                                <div className="card-content" style={{ padding: '20px' }}>
                                    <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: '600', color: '#2c3e50' }}>
                                        {c.name}
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#007bff' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                                        <span style={{ fontSize: '14px' }}>{c.doctors?.length || 0} แพทย์ผู้เชี่ยวชาญ</span>
                                    </div>
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