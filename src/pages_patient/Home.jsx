import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Home.css'; 

// --- Icon Mapping Configuration ---
const DEPARTMENT_ICONS = {
    'หู คอ จมูก': '👂',
    'วัคซีน': '💉',
    'ส่งเสริมสุขภาพ': '🩺',
    'ทันตกรรม': '🦷',
    'สุขภาพสตรี': '👩',
    'แพทย์แผนจีน': '🧧',
    'ระบบทางเดินอาหาร': '🤢',
    'ผิวหนัง': '🧴',
    'ทางเดินหายใจ': '👃',
    'กระดูกและข้อ': '🦴',
    'รังสีวินิจฉัย X-Ray': '☢️',
    'ฉุกเฉิน': '🚑',
    'อายุรกรรม': '💊',
    'กุมารเวช': '👶',
    'หัวใจ': '❤️',
    'ตา': '👁️'
};

const DEFAULT_ICON = '🏥';

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
    const [filteredClinics, setFilteredClinics] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    
    const [departments, setDepartments] = useState([]);
    const [locations, setLocations] = useState(['ทั้งหมด']); 
    const [activeLocation, setActiveLocation] = useState('ทั้งหมด');

    const navigate = useNavigate();
    const location = useLocation();

    // --- Effect ---
    useEffect(() => {
        const user = JSON.parse(sessionStorage.getItem('currentUser'));
        setCurrentUser(user || null);
        
        // 1. โหลดข้อมูลคลินิก
        const storedClinics = JSON.parse(localStorage.getItem('clinicsData')) || [];
        setClinicsData(storedClinics);
        setFilteredClinics(storedClinics);

        // 2. ดึงชื่อโรงพยาบาลมาทำ Tab
        if (storedClinics.length > 0) {
            const clinicNames = storedClinics.map(c => c.name);
            setLocations(['ทั้งหมด', ...clinicNames]);
        }

        // 3. สร้างรายการแผนกจากหมอที่มีอยู่จริง
        const activeSpecialties = new Set();
        storedClinics.forEach(clinic => {
            if (clinic.doctors) {
                clinic.doctors.forEach(doc => {
                    if (doc.specialty) {
                        activeSpecialties.add(doc.specialty.trim());
                    }
                });
            }
        });

        const dynamicDepartments = Array.from(activeSpecialties).map((specialty, index) => {
            return {
                id: `dept-${index}`,
                name: specialty,
                icon: DEPARTMENT_ICONS[specialty] || DEFAULT_ICON
            };
        });

        setDepartments(dynamicDepartments);
        
    }, [location.pathname]); 

    // --- Search & Filter Logic ---
    useEffect(() => {
        let results = clinicsData;

        if (activeLocation !== 'ทั้งหมด') {
            results = results.filter(c => c.name === activeLocation);
        }

        if (searchTerm.trim() !== '') {
            const lowerTerm = searchTerm.toLowerCase();
            results = results.filter(clinic => {
                if (clinic.name.toLowerCase().includes(lowerTerm)) return true;
                if (clinic.doctors && clinic.doctors.some(doc => 
                    doc.name.toLowerCase().includes(lowerTerm) || 
                    doc.specialty.toLowerCase().includes(lowerTerm)
                )) return true;
                return false;
            });
        }

        setFilteredClinics(results);

    }, [searchTerm, activeLocation, clinicsData]);

    // --- Handlers ---
    const handleSelectClinic = (id) => {
        localStorage.setItem('selectedClinicId', id);
        navigate('/patient/clinic-detail'); 
    };

    const handleSelectDepartment = (deptName) => {
        setSearchTerm(deptName);
        // เมื่อเลือกแผนก ให้เลื่อนขึ้นไปดูผลลัพธ์ที่รายการคลินิก (ซึ่งตอนนี้อยู่ด้านบนแล้ว)
        document.getElementById('clinic-results')?.scrollIntoView({ behavior: 'smooth' });
    };
    
    const welcomeName = currentUser ? currentUser.name : 'คุณผู้ใช้';

    // --- Styles ---
    const pageStyle = {
        position: 'relative',
        width: '100%',
        maxWidth: '1440px',
        minHeight: '100vh',
        background: '#FFFFFF',
        margin: '0 auto',
        boxSizing: 'border-box',
        paddingBottom: '50px'
    };

    const heroSectionStyle = {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '40px',
        alignItems: 'center',
        marginBottom: '30px',
        marginTop: '20px'
    };

    const searchBoxStyle = {
        backgroundColor: 'rgba(174, 226, 243, 1)',
        padding: '30px',
        borderRadius: '20px',
        boxShadow: '0 4px 15px rgba(174, 226, 243, 0.4)'
    };

    return (
        <div id="page-home" className="page active" style={pageStyle}>
            <main className="container" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                
                {/* 1. Hero Section */}
                <div style={heroSectionStyle}>
                    <div style={{ flex: '1 1 400px' }}>
                        <h1 style={{ fontSize: '32px', color: '#333', marginBottom: '25px', lineHeight: '1.2' }}>
                            นัดหมอ ออนไลน์ไม่ต้องรอนาน
                        </h1>
                        
                        <div style={searchBoxStyle}>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                <div style={{ 
                                    flex: 1, position: 'relative', display: 'flex', alignItems: 'center',
                                    backgroundColor: 'white', borderRadius: '10px', overflow: 'hidden'
                                }}>
                                    <div style={{ paddingLeft: '15px', display: 'flex' }}><SearchIcon /></div>
                                    <input 
                                        type="text" 
                                        placeholder="ชื่อหมอ , ชื่อโรงพยาบาล, ..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ width: '100%', padding: '12px 15px', border: 'none', outline: 'none', fontSize: '16px' }}
                                    />
                                </div>
                                <button style={{
                                    backgroundColor: 'black', color: 'white', border: 'none', borderRadius: '10px',
                                    padding: '0 25px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold'
                                }}>ค้นหา</button>
                            </div>
                            <p style={{ fontSize: '14px', color: '#333', lineHeight: '1.6', margin: 0 }}>
                                พิมพ์ชื่อหมอหรือโรงพยาบาลที่คุณต้องการค้นหาในช่องค้นหา เราจะแนะนำหมอที่เชี่ยวชาญในด้านนั้นๆ ให้กับคุณเลือกดูหรือปรึกษาได้ตรงความต้องการ
                            </p>
                        </div>
                    </div>

                    <div style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center' }}>
                        <img 
                            src="https://img.freepik.com/free-photo/team-young-specialist-doctors-standing-corridor-hospital_1303-21199.jpg" 
                            alt="Doctors Team"
                            style={{ width: '100%', maxWidth: '500px', height: '300px', objectFit: 'cover', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                        />
                    </div>
                </div>

                {/* 2. ส่วนทักทาย (Greeting) */}
                <div id="clinic-results" style={{ marginTop: '20px', marginBottom: '30px' }}>
                    <h2 style={{ marginTop: 5, marginBottom: '0.5rem', fontSize: '25px', color: '#333', }}>
                        สวัสดี, {welcomeName}
                    </h2>
                    <h3 style={{ marginTop: 0, color: '#666', fontWeight: 'normal' }}>
                        {activeLocation !== 'ทั้งหมด' 
                            ? `โรงพยาบาลที่เลือก: ${activeLocation}` 
                            : (searchTerm ? `ผลลัพธ์การค้นหา: "${searchTerm}"` : 'เลือกโรงพยาบาล / คลินิกที่คุณต้องการเข้ารับบริการ')
                        }
                    </h3>
                </div>

                {/* 3. รายการคลินิก (Clinic List) -- ย้ายขึ้นมาตรงนี้ -- */}
                <div id="clinic-list" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                    gap: '25px',
                    marginBottom: '50px' // เพิ่มระยะห่างข้างล่างก่อนถึงส่วนแผนก
                }}>
                    {filteredClinics.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: '#888', background: '#f9f9f9', borderRadius: '10px' }}>
                            <p style={{fontSize: '18px'}}>ไม่พบข้อมูลคลินิก</p>
                            <p style={{fontSize: '14px'}}>ลองเลือก Tab "ทั้งหมด" หรือเปลี่ยนคำค้นหา</p>
                        </div>
                    ) : (
                        filteredClinics.map(c => (
                            <div 
                                key={c.id} 
                                className="card card-clinic" 
                                onClick={() => handleSelectClinic(c.id)}
                                style={{
                                    cursor: 'pointer', border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden',
                                    boxShadow: '0 4px 12px rgba(45, 183, 201, 1)', transition: 'transform 0.2s', background: '#fff'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ overflow: 'hidden', height: '200px' }}>
                                    <img 
                                        src={c.image} alt={c.name} 
                                        onError={(e) => e.target.src='https://placehold.co/600x400/eeeeee/cccccc?text=No+Image'} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                                <div className="card-content" style={{ padding: '20px' }}>
                                    <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: '600', color: '#2c3e50' }}>{c.name}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#007bff' }}>
                                        <span style={{ fontSize: '14px' }}>{c.doctors?.length || 0} แพทย์ทั้งหมด</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* 4. แผนก (Departments) -- ย้ายลงมาล่างสุด -- */}
                <div className="department-section" style={{ marginBottom: '40px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                    <h2 style={{ fontSize: '24px', color: '#2c3e50', marginBottom: '20px', fontWeight: 'bold' }}>
                        แผนกและโรงพยาบาล
                    </h2>
                    
                    <div className="location-tabs">
                        {locations.map((loc) => (
                            <button 
                                key={loc} 
                                className={`tab-button ${activeLocation === loc ? 'active' : ''}`}
                                onClick={() => setActiveLocation(loc)}
                            >
                                {loc}
                            </button>
                        ))}
                    </div>

                    <div className="department-grid">
                        {departments.length === 0 && (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#999', padding: '40px', background: '#f9f9f9', borderRadius: '10px' }}>
                                ยังไม่มีข้อมูลแผนก (ระบบจะแสดงแผนกอัตโนมัติตามความเชี่ยวชาญของแพทย์ที่มีในระบบ)
                            </div>
                        )}

                        {departments.map((dept) => (
                            <div key={dept.id} className="department-card" onClick={() => handleSelectDepartment(dept.name)}>
                                <div className="icon-circle">
                                    {dept.icon.includes('http') || dept.icon.includes('data:image') ? (
                                        <img src={dept.icon} alt={dept.name} className="dept-img" />
                                    ) : (
                                        <span className="dept-emoji">{dept.icon}</span>
                                    )}
                                </div>
                                <p className="dept-name">{dept.name}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </main>
        </div>
    );
}

export default Home;