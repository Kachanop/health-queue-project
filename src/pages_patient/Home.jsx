import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
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
    const { t } = useLanguage();
    // --- State ---
    const [clinicsData, setClinicsData] = useState([]);
    const [filteredClinics, setFilteredClinics] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    
    const [departments, setDepartments] = useState([]);
    const [locations, setLocations] = useState([t('all')]); 
    const [activeLocation, setActiveLocation] = useState(t('all'));
    
    // State สำหรับแพทย์แนะนำ
    const [allDoctors, setAllDoctors] = useState([]);
    const [showAllDoctors, setShowAllDoctors] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [showDoctorModal, setShowDoctorModal] = useState(false);

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
            setLocations([t('all'), ...clinicNames]);
        }

        // 3. สร้างรายการแผนกจากหมอที่มีอยู่จริง และรวบรวมหมอทั้งหมด
        const activeSpecialties = new Set();
        const doctorsList = [];
        
        storedClinics.forEach(clinic => {
            if (clinic.doctors) {
                clinic.doctors.forEach(doc => {
                    // เพิ่มข้อมูลคลินิกให้หมอ
                    doctorsList.push({
                        ...doc,
                        clinicId: clinic.id,
                        clinicName: clinic.name,
                        clinicImage: clinic.image
                    });
                    if (doc.specialty) {
                        activeSpecialties.add(doc.specialty.trim());
                    }
                });
            }
        });
        
        setAllDoctors(doctorsList);

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

        if (activeLocation !== t('all')) {
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
    
    // เปิดโปรไฟล์หมอ
    const handleViewDoctorProfile = (doctor) => {
        setSelectedDoctor(doctor);
        setShowDoctorModal(true);
    };
    
    // นัดหมายกับหมอ
    const handleBookDoctor = (doctor) => {
        localStorage.setItem('selectedClinicId', doctor.clinicId);
        localStorage.setItem('selectedDoctorId', doctor.id);
        localStorage.setItem('selectedDoctorData', JSON.stringify(doctor));
        navigate('/patient/clinic-detail');
    };
    
    const welcomeName = currentUser ? currentUser.name : 'คุณผู้ใช้';
    
    // หมอที่แสดง (8 คนแรก หรือทั้งหมด)
    const displayedDoctors = showAllDoctors ? allDoctors : allDoctors.slice(0, 8);

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
                
                {/* Doctor Profile Modal */}
                {showDoctorModal && selectedDoctor && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        backdropFilter: 'blur(4px)'
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '24px',
                            padding: '0',
                            maxWidth: '500px',
                            width: '95%',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            position: 'relative',
                            boxShadow: '0 25px 80px rgba(0,0,0,0.3)'
                        }}>
                            {/* Header with gradient */}
                            <div style={{
                                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                                padding: '2rem',
                                borderRadius: '24px 24px 0 0',
                                textAlign: 'center',
                                position: 'relative'
                            }}>
                                <button
                                    onClick={() => setShowDoctorModal(false)}
                                    style={{
                                        position: 'absolute',
                                        top: '1rem',
                                        right: '1rem',
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '36px',
                                        height: '36px',
                                        cursor: 'pointer',
                                        fontSize: '1.25rem',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    ×
                                </button>
                                
                                <div style={{
                                    width: '120px',
                                    height: '120px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
                                    margin: '0 auto 1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '4px solid white',
                                    overflow: 'hidden',
                                    boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
                                }}>
                                    {selectedDoctor.image ? (
                                        <img src={selectedDoctor.image} alt={selectedDoctor.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                    ) : (
                                        <span style={{fontSize: '3rem'}}>👨‍⚕️</span>
                                    )}
                                </div>
                                
                                <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                                    {selectedDoctor.name}
                                </h2>
                                
                                <span style={{
                                    display: 'inline-block',
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    padding: '0.4rem 1rem',
                                    borderRadius: '20px',
                                    fontSize: '0.9rem',
                                    fontWeight: '500'
                                }}>
                                    {selectedDoctor.specialty}
                                </span>
                            </div>
                            
                            <div style={{padding: '1.5rem 2rem'}}>
                                <div style={{display: 'grid', gap: '1rem', marginBottom: '1.5rem'}}>
                                    {selectedDoctor.subSpecialty && (
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                                            padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '12px', border: '1px solid #bfdbfe'
                                        }}>
                                            <span style={{fontSize: '1.5rem'}}>🎓</span>
                                            <div>
                                                <div style={{fontSize: '0.75rem', color: '#6b7280'}}>ความชำนาญพิเศษ</div>
                                                <div style={{fontSize: '0.95rem', color: '#1e40af', fontWeight: '600'}}>{selectedDoctor.subSpecialty}</div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                                        padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0'
                                    }}>
                                        <span style={{fontSize: '1.5rem'}}>🏥</span>
                                        <div>
                                            <div style={{fontSize: '0.75rem', color: '#6b7280'}}>โรงพยาบาล / คลินิก</div>
                                            <div style={{fontSize: '0.95rem', color: '#166534', fontWeight: '600'}}>{selectedDoctor.clinicName}</div>
                                        </div>
                                    </div>
                                    
                                    {selectedDoctor.experience && (
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                                            padding: '1rem', backgroundColor: '#fffbeb', borderRadius: '12px', border: '1px solid #fde68a'
                                        }}>
                                            <span style={{fontSize: '1.5rem'}}>⭐</span>
                                            <div>
                                                <div style={{fontSize: '0.75rem', color: '#6b7280'}}>ประสบการณ์</div>
                                                <div style={{fontSize: '0.95rem', color: '#d97706', fontWeight: '600'}}>{selectedDoctor.experience}</div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {selectedDoctor.education && (
                                        <div style={{
                                            display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                                            padding: '1rem', backgroundColor: '#faf5ff', borderRadius: '12px', border: '1px solid #e9d5ff'
                                        }}>
                                            <span style={{fontSize: '1.5rem'}}>📚</span>
                                            <div>
                                                <div style={{fontSize: '0.75rem', color: '#6b7280'}}>การศึกษา</div>
                                                <div style={{fontSize: '0.9rem', color: '#7c3aed', fontWeight: '500', lineHeight: '1.5'}}>{selectedDoctor.education}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div style={{display: 'flex', gap: '0.75rem'}}>
                                    <button
                                        onClick={() => { setShowDoctorModal(false); handleBookDoctor(selectedDoctor); }}
                                        style={{
                                            flex: 1, padding: '1rem', backgroundColor: '#1e40af', color: 'white',
                                            border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: '600',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                            boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)'
                                        }}
                                    >
                                        <span>📅</span> นัดหมายแพทย์
                                    </button>
                                    <button
                                        onClick={() => setShowDoctorModal(false)}
                                        style={{
                                            padding: '1rem 1.5rem', backgroundColor: '#f1f5f9', color: '#64748b',
                                            border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: '500', cursor: 'pointer'
                                        }}
                                    >
                                        ปิด
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* 1. Hero Section */}
                <div style={heroSectionStyle}>
                    <div style={{ flex: '1 1 400px' }}>
                        <h1 style={{ fontSize: '32px', color: '#333', marginBottom: '25px', lineHeight: '1.2' }}>
                            {t('bookOnline')}
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
                                        placeholder={t('searchPlaceholder')} 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ width: '100%', padding: '12px 15px', border: 'none', outline: 'none', fontSize: '16px' }}
                                    />
                                </div>
                                <button style={{
                                    backgroundColor: 'black', color: 'white', border: 'none', borderRadius: '10px',
                                    padding: '0 25px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold'
                                }}>{t('search')}</button>
                            </div>
                            <p style={{ fontSize: '14px', color: '#333', lineHeight: '1.6', margin: 0 }}>
                                {t('searchHint')}
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

                {/* 2. แพทย์แนะนำ (Recommended Doctors) */}
                {allDoctors.length > 0 && (
                    <div style={{ marginTop: '40px', marginBottom: '50px' }}>
                        <h2 style={{ 
                            fontSize: '24px', 
                            color: '#1e40af', 
                            marginBottom: '25px',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            แพทย์แนะนำ
                        </h2>
                        
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '24px'
                        }}>
                            {displayedDoctors.map((doctor, index) => (
                                <div 
                                    key={`${doctor.id}-${index}`}
                                    style={{
                                        backgroundColor: 'white',
                                        borderRadius: '20px',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                        border: '1px solid #e5e7eb',
                                        transition: 'all 0.3s ease',
                                        overflow: 'hidden',
                                        position: 'relative'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-6px)';
                                        e.currentTarget.style.boxShadow = '0 12px 30px rgba(30, 64, 175, 0.15)';
                                        e.currentTarget.style.borderColor = '#3b82f6';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                                        e.currentTarget.style.borderColor = '#e5e7eb';
                                    }}
                                >
                                    {/* Instant Booking Badge */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '16px',
                                        left: '16px',
                                        backgroundColor: '#fbbf24',
                                        color: '#1e293b',
                                        padding: '6px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        boxShadow: '0 2px 8px rgba(251, 191, 36, 0.4)',
                                        zIndex: 10
                                    }}>
                                        <span>⚡</span> Instant Booking
                                    </div>
                                    
                                    {/* Top Section - Gradient Background */}
                                    <div style={{
                                        background: 'linear-gradient(180deg, #e0f2fe 0%, #f0f9ff 50%, #ffffff 100%)',
                                        padding: '60px 20px 20px 20px',
                                        textAlign: 'center'
                                    }}>
                                        {/* Doctor Avatar */}
                                        <div style={{
                                            width: '120px',
                                            height: '120px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #e0e7ff 0%, #dbeafe 100%)',
                                            margin: '0 auto 16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '4px solid #3b82f6',
                                            overflow: 'hidden',
                                            boxShadow: '0 8px 24px rgba(59, 130, 246, 0.25)'
                                        }}>
                                            {doctor.image ? (
                                                <img src={doctor.image} alt={doctor.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                            ) : (
                                                <span style={{fontSize: '3.5rem'}}>👨‍⚕️</span>
                                            )}
                                        </div>
                                        
                                        {/* Doctor Name */}
                                        <h4 style={{
                                            fontSize: '1.1rem',
                                            fontWeight: '700',
                                            color: '#1e40af',
                                            marginBottom: '8px'
                                        }}>
                                            {doctor.name}
                                        </h4>
                                        
                                        {/* Specialty */}
                                        <p style={{
                                            fontSize: '0.9rem',
                                            color: '#64748b',
                                            marginBottom: '12px'
                                        }}>
                                            {doctor.specialty}
                                        </p>
                                        
                                        {/* Sub-Specialty Tag */}
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '6px 16px',
                                            backgroundColor: '#dbeafe',
                                            color: '#1e40af',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                            border: '1px solid #93c5fd'
                                        }}>
                                            {doctor.subSpecialty || doctor.specialty}
                                        </span>
                                    </div>
                                    
                                    {/* Bottom Section - Action Buttons */}
                                    <div style={{
                                        display: 'flex',
                                        borderTop: '1px solid #e5e7eb'
                                    }}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleBookDoctor(doctor);
                                            }}
                                            style={{
                                                flex: 1,
                                                padding: '14px',
                                                backgroundColor: 'white',
                                                color: '#1e40af',
                                                border: 'none',
                                                borderRight: '1px solid #e5e7eb',
                                                fontSize: '0.9rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#eff6ff';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'white';
                                            }}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                                <line x1="16" y1="2" x2="16" y2="6"/>
                                                <line x1="8" y1="2" x2="8" y2="6"/>
                                                <line x1="3" y1="10" x2="21" y2="10"/>
                                            </svg>
                                            นัดหมาย
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewDoctorProfile(doctor);
                                            }}
                                            style={{
                                                flex: 1,
                                                padding: '14px',
                                                backgroundColor: 'white',
                                                color: '#64748b',
                                                border: 'none',
                                                fontSize: '0.9rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#f8fafc';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'white';
                                            }}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10"/>
                                                <line x1="12" y1="16" x2="12" y2="12"/>
                                                <line x1="12" y1="8" x2="12.01" y2="8"/>
                                            </svg>
                                            รายละเอียด
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Show All Button */}
                        {allDoctors.length > 8 && (
                            <div style={{textAlign: 'center', marginTop: '25px'}}>
                                <button
                                    onClick={() => setShowAllDoctors(!showAllDoctors)}
                                    style={{
                                        padding: '12px 32px',
                                        backgroundColor: 'white',
                                        color: '#1e40af',
                                        border: '2px solid #1e40af',
                                        borderRadius: '25px',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#1e40af';
                                        e.currentTarget.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'white';
                                        e.currentTarget.style.color = '#1e40af';
                                    }}
                                >
                                    {showAllDoctors ? 'แสดงน้อยลง' : 'แสดงแพทย์ทั้งหมด'}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* 3. ส่วนทักทาย (Greeting) */}
                <div id="clinic-results" style={{ marginTop: '20px', marginBottom: '30px' }}>
                    <h2 style={{ marginTop: 5, marginBottom: '0.5rem', fontSize: '25px', color: '#333', }}>
                        {t('welcomeMessage')}, {welcomeName}
                    </h2>
                    <h3 style={{ marginTop: 0, color: '#666', fontWeight: 'normal' }}>
                        {activeLocation !== t('all') 
                            ? `${t('selectedHospital')}: ${activeLocation}` 
                            : (searchTerm ? `${t('searchResults')}: "${searchTerm}"` : t('selectHospital'))
                        }
                    </h3>
                </div>

                {/* 4. รายการคลินิก (Clinic List) */}
                <div id="clinic-list" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                    gap: '25px',
                    marginBottom: '50px'
                }}>
                    {filteredClinics.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: '#888', background: '#f9f9f9', borderRadius: '10px' }}>
                            <p style={{fontSize: '18px'}}>{t('noClinicFound')}</p>
                            <p style={{fontSize: '14px'}}>{t('trySelectAll')}</p>
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
                                        <span style={{ fontSize: '14px' }}>{c.doctors?.length || 0} {t('allDoctors')}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* 5. แผนก (Departments) */}
                <div className="department-section" style={{ marginBottom: '40px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                    <h2 style={{ fontSize: '24px', color: '#2c3e50', marginBottom: '20px', fontWeight: 'bold' }}>
                        {t('departmentsAndHospitals')}
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
                                {t('noDepartment')}
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