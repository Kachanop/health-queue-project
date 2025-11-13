import React, { useState, useEffect, useMemo } from 'react';
// (CSS ถูก import ใน main.jsx แล้ว)

// (Component: Modal แก้ไขแพทย์)
function EditDoctorModal({ doctor, isOpen, onClose, onSave }) {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (doctor) {
            setFormData({
                name: doctor.name || '',
                specialty: doctor.specialty || '',
                email: doctor.email || '',
            });
        }
    }, [doctor]);

    if (!isOpen || !doctor) return null;

    const handleChange = (e) => {
        const { id, value } = e.target;
        const key = id.replace('edit-doctor-', '');
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(doctor.id, formData);
        onClose();
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div id="edit-doctor-modal" className="modal-overlay active" onClick={handleBackdropClick}>
            <div className="modal-content">
                <button id="close-doctor-modal-btn" className="modal-close-btn" onClick={onClose}>&times;</button>
                <h3>แก้ไขข้อมูลแพทย์</h3>
                <form id="edit-doctor-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="edit-doctor-name">ชื่อแพทย์</label>
                        <input type="text" id="edit-doctor-name" className="input" required 
                               value={formData.name} onChange={handleChange} />
                    </div>
                    <div className="input-group">
                        <label htmlFor="edit-doctor-specialty">แผนก/ความเชี่ยวชาญ</label>
                        <input type="text" id="edit-doctor-specialty" className="input" required 
                               value={formData.specialty} onChange={handleChange} />
                    </div>
                    <div className="input-group">
                        <label htmlFor="edit-doctor-email">อีเมลแพทย์</label>
                        <input type="email" id="edit-doctor-email" className="input" required 
                               value={formData.email} onChange={handleChange} />
                    </div>
                    <hr />
                    <button type="submit" className="btn btn-success">บันทึกการเปลี่ยนแปลง</button>
                </form>
            </div>
        </div>
    );
}


// (Component: หน้าหลักจัดการคลินิก)
function Clinics() {
    // --- State ---
    const [view, setView] = useState('master'); // 'master', 'detail'
    const [clinicsData, setClinicsData] = useState([]);
    const [currentEditingClinicId, setCurrentEditingClinicId] = useState(null);
    
    // (State สำหรับ Forms)
    const [addClinicName, setAddClinicName] = useState('');
    const [addClinicImage, setAddClinicImage] = useState('');
    const [editClinicName, setEditClinicName] = useState('');
    const [editClinicImage, setEditClinicImage] = useState('');
    const [addDoctorName, setAddDoctorName] = useState('');
    const [addDoctorSpecialty, setAddDoctorSpecialty] = useState('');
    const [addDoctorEmail, setAddDoctorEmail] = useState('');
    const [clinicSearchTerm, setClinicSearchTerm] = useState('');
    const [doctorSearchTerm, setDoctorSearchTerm] = useState('');
    const [activeSpecialty, setActiveSpecialty] = useState('all');
    const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
    const [currentEditingDoctor, setCurrentEditingDoctor] = useState(null);

    // --- Data Loading ---
    useEffect(() => {
        const storedClinics = JSON.parse(localStorage.getItem('clinicsData')) || [];
        setClinicsData(storedClinics);
    }, []);

    // --- Helper Functions ---
    const saveClinicsData = (updatedData) => {
        setClinicsData(updatedData);
        localStorage.setItem('clinicsData', JSON.stringify(updatedData));
    };

    // --- Memoized Data (กรองข้อมูล) ---
    const filteredClinics = useMemo(() => {
        const term = clinicSearchTerm.toLowerCase();
        if (!term) return clinicsData;
        return clinicsData.filter(clinic => 
            clinic.name.toLowerCase().includes(term)
        );
    }, [clinicsData, clinicSearchTerm]);

    const selectedClinic = useMemo(() => {
        if (view !== 'detail' || !currentEditingClinicId) return null;
        return clinicsData.find(c => c.id === currentEditingClinicId);
    }, [clinicsData, currentEditingClinicId, view]);

    const specialties = useMemo(() => {
        if (!selectedClinic) return {};
        return selectedClinic.doctors.reduce((acc, doctor) => {
            const specialty = doctor.specialty || "ไม่มีแผนก";
            if (!acc[specialty]) acc[specialty] = 0;
            acc[specialty]++;
            return acc;
        }, {});
    }, [selectedClinic]);

    const filteredDoctors = useMemo(() => {
        if (!selectedClinic) return [];
        const term = doctorSearchTerm.toLowerCase();
        
        return selectedClinic.doctors.filter(d => {
            const nameMatch = d.name.toLowerCase().includes(term);
            if (term && !nameMatch) return false;
            
            const specialtyMatch = (activeSpecialty === 'all') || (d.specialty || "ไม่มีแผนก") === activeSpecialty;
            return specialtyMatch;
        });

    }, [selectedClinic, doctorSearchTerm, activeSpecialty]);


    // --- Event Handlers (Clinic Master) ---
    const handleAddClinic = (e) => {
        e.preventDefault();
        let image = addClinicImage.trim();
        if (image === '') {
            image = `https://placehold.co/600x400/008080/FFFFFF?text=${encodeURIComponent(addClinicName)}`;
        }
        const newClinic = { id: Date.now(), name: addClinicName, image: image, doctors: [] };
        saveClinicsData([...clinicsData, newClinic]);
        setAddClinicName('');
        setAddClinicImage('');
        alert('เพิ่มคลินิกใหม่เรียบร้อยแล้ว');
    };

    const handleOpenClinicDetail = (id) => {
        const clinic = clinicsData.find(c => c.id === id);
        if (!clinic) return;
        setCurrentEditingClinicId(id);
        setEditClinicName(clinic.name);
        setEditClinicImage(clinic.image);
        setDoctorSearchTerm('');
        setActiveSpecialty('all');
        setView('detail');
        window.scrollTo(0, 0);
    };
    
    // --- Event Handlers (Clinic Detail) ---
    const handleBackToMaster = () => {
        setCurrentEditingClinicId(null);
        setView('master');
        window.scrollTo(0, 0);
    };

    const handleEditClinic = (e) => {
        e.preventDefault();
        if (!selectedClinic) return;
        let image = editClinicImage.trim();
        if (image === '') {
            image = `https://placehold.co/600x400/008080/FFFFFF?text=${encodeURIComponent(editClinicName)}`;
        }
        const updatedData = clinicsData.map(c => {
            if (c.id === selectedClinic.id) {
                return { ...c, name: editClinicName, image: image };
            }
            return c;
        });
        saveClinicsData(updatedData);
        alert('แก้ไขข้อมูลคลินิกเรียบร้อยแล้ว');
    };

    const handleDeleteClinic = () => {
        if (!selectedClinic) return;
        if (window.confirm(`คุณต้องการลบคลินิก "${selectedClinic.name}" ใช่หรือไม่? \n(การกระทำนี้จะลบแพทย์ทั้งหมดในคลินิกนี้ด้วย!)`)) {
            const updatedData = clinicsData.filter(c => c.id !== selectedClinic.id);
            saveClinicsData(updatedData);
            alert('ลบคลินิกเรียบร้อยแล้ว');
            handleBackToMaster();
        }
    };

    // --- Event Handlers (Doctor Management) ---
    const handleAddDoctor = (e) => {
        e.preventDefault();
        if (!selectedClinic) return;

        const newDoctor = {
            id: Date.now(), name: addDoctorName,
            specialty: addDoctorSpecialty || "ไม่มีแผนก",
            email: addDoctorEmail, packages: []
        };
        const updatedData = clinicsData.map(c => {
            if (c.id === selectedClinic.id) {
                return { ...c, doctors: [...c.doctors, newDoctor] };
            }
            return c;
        });
        saveClinicsData(updatedData);
        setAddDoctorName('');
        setAddDoctorSpecialty('');
        setAddDoctorEmail('');
        alert('เพิ่มแพทย์ใหม่เรียบร้อยแล้ว');
    };

    const handleDeleteDoctor = (doctorId) => {
        if (!selectedClinic) return;
        const doctor = selectedClinic.doctors.find(d => d.id === doctorId);
        if (!doctor) return;
        if (window.confirm(`คุณต้องการลบแพทย์ "${doctor.name}" ใช่หรือไม่?`)) {
            const updatedDoctors = selectedClinic.doctors.filter(d => d.id !== doctorId);
            const updatedData = clinicsData.map(c => {
                if (c.id === selectedClinic.id) {
                    return { ...c, doctors: updatedDoctors };
                }
                return c;
            });
            saveClinicsData(updatedData);
            alert('ลบแพทย์เรียบร้อยแล้ว');
        }
    };
    
    // --- Event Handlers (Doctor Modal) ---
    const handleOpenDoctorModal = (doctorId) => {
        if (!selectedClinic) return;
        const doctor = selectedClinic.doctors.find(d => d.id === doctorId);
        if (doctor) {
            setCurrentEditingDoctor(doctor);
            setIsDoctorModalOpen(true);
        }
    };
    
    const handleCloseDoctorModal = () => {
        setIsDoctorModalOpen(false);
        setCurrentEditingDoctor(null);
    };

    const handleSaveDoctorEdit = (doctorId, updatedDoctorData) => {
        if (!selectedClinic) return;
        const updatedDoctors = selectedClinic.doctors.map(d => {
            if (d.id === doctorId) {
                return { ...d, ...updatedDoctorData };
            }
            return d;
        });
        const updatedClinicsData = clinicsData.map(c => {
             if (c.id === selectedClinic.id) {
                return { ...c, doctors: updatedDoctors };
            }
            return c;
        });
        saveClinicsData(updatedClinicsData);
        alert('แก้ไขข้อมูลแพทย์เรียบร้อยแล้ว');
    };

    // --- Render Functions ---

    // (View: หน้า Master)
    if (view === 'master') {
        return (
            // (ลบ Header ออกแล้ว)
            <div id="page-manage-clinics" className="page active">
                <main className="container">
                    <div className="card">
                        <h3>เพิ่มคลินิก (โรงพยาบาล) ใหม่</h3>
                        <form id="add-clinic-form" className="manage-form" onSubmit={handleAddClinic}>
                            <div className="input-group">
                                <label htmlFor="add-clinic-name">ชื่อคลินิก</label>
                                <input type="text" id="add-clinic-name" className="input" required 
                                       placeholder="เช่น รพ.สมิติเวช สุขุมวิท"
                                       value={addClinicName} onChange={(e) => setAddClinicName(e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label htmlFor="add-clinic-image">URL รูปภาพ (ไม่บังคับ)</label>
                                <input type="url" id="add-clinic-image" className="input" 
                                       placeholder="https://example.com/image.jpg"
                                       value={addClinicImage} onChange={(e) => setAddClinicImage(e.target.value)} />
                            </div>
                            <button type="submit" className="btn btn-success">เพิ่มคลินิกใหม่</button>
                        </form>
                    </div>
                    
                    <div className="list-header">
                        <h4>รายชื่อคลินิกที่มีอยู่</h4>
                        <div className="search-bar">
                            <input type="search" id="clinic-search-input" className="input" 
                                   placeholder="ค้นหาคลินิก..."
                                   value={clinicSearchTerm} onChange={(e) => setClinicSearchTerm(e.target.value)} />
                        </div>
                    </div>
                    <div id="clinic-manage-list">
                        {filteredClinics.length === 0 ? (
                            clinicSearchTerm ? 
                                <p className="text-center">ไม่พบคลินิกที่ตรงกับคำค้นหา</p> : 
                                <p className="text-center">ยังไม่มีคลินิกในระบบ</p>
                        ) : (
                            filteredClinics.map(clinic => (
                                <div key={clinic.id} className="card admin-appointment-item">
                                    <div className="item-info" style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                                        <img src={clinic.image} alt={clinic.name} className="item-thumbnail" 
                                             onError={(e) => e.target.src='https://placehold.co/80x50/eeeeee/cccccc?text=Img'}
                                             style={{width: '80px', height: '50px', objectFit: 'cover', borderRadius: '4px'}}
                                        />
                                        <div>
                                            <h4>{clinic.name}</h4>
                                            <small>ID: {clinic.id} | มีแพทย์ {clinic.doctors.length} คน</small>
                                        </div>
                                    </div>
                                    <div className="admin-actions">
                                        <button className="btn" onClick={() => handleOpenClinicDetail(clinic.id)} style={{width: 'auto', padding: '0.5rem 1rem'}}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h9z"></path><line x1="12" y1="2" x2="12" y2="22"></line></svg>
                                            <span style={{marginLeft: '0.5rem'}}>จัดการ</span>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </main>
            </div>
        );
    }

    // (View: หน้า Detail)
    if (view === 'detail' && selectedClinic) {
        return (
            // (ลบ Header ออกแล้ว)
            <div id="page-manage-clinic-detail" className="page active">
                <main className="container">
                    <a href="#" className="back-link" onClick={(e) => { e.preventDefault(); handleBackToMaster(); }}>
                        &larr; กลับไปหน้าจัดการคลินิก
                    </a>
                    <h2 style={{marginTop: '0.5rem'}}>{selectedClinic.name}</h2>
                    
                    <div className="edit-clinic-section">
                        <h4>แก้ไขข้อมูลคลินิก</h4>
                        <form id="edit-clinic-form" className="manage-form" onSubmit={handleEditClinic}>
                            <div className="input-group">
                                <label htmlFor="edit-clinic-name">ชื่อคลินิก</label>
                                <input type="text" id="edit-clinic-name" className="input" required 
                                       value={editClinicName} onChange={(e) => setEditClinicName(e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label htmlFor="edit-clinic-image">URL รูปภาพ</label>
                                <input type="url" id="edit-clinic-image" className="input" 
                                       value={editClinicImage} onChange={(e) => setEditClinicImage(e.target.value)} />
                            </div>
                            <button type="submit" className="btn">บันทึกการเปลี่ยนแปลง</button>
                        </form>
                        <hr />
                        <button id="delete-clinic-btn" className="btn btn-danger" onClick={handleDeleteClinic}>ลบคลินิกนี้</button>
                    </div>
                    
                    <div className="edit-clinic-section">
                        <h4>เพิ่มแพทย์ใหม่ในคลินิกนี้</h4>
                        <form id="add-doctor-form" className="manage-form" onSubmit={handleAddDoctor}>
                            <div className="input-group">
                                <label htmlFor="add-doctor-name">ชื่อแพทย์</label>
                                <input type="text" id="add-doctor-name" className="input" required 
                                       placeholder="เช่น นพ. สมชาย ใจดี"
                                       value={addDoctorName} onChange={(e) => setAddDoctorName(e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label htmlFor="add-doctor-specialty">แผนก/ความเชี่ยวชาญ</label>
                                <input type="text" id="add-doctor-specialty" className="input" required 
                                       placeholder="เช่น อายุรศาสตร์"
                                       value={addDoctorSpecialty} onChange={(e) => setAddDoctorSpecialty(e.target.value)} />
                            </div>
                            <div className="input-group" style={{gridColumn: 'span 2'}}>
                                <label htmlFor="add-doctor-email">อีเมลแพทย์ (สำหรับรับการแจ้งเตือน)</label>
                                <input type="email" id="add-doctor-email" className="input" required 
                                       placeholder="doctor@example.com"
                                       value={addDoctorEmail} onChange={(e) => setAddDoctorEmail(e.target.value)} />
                            </div>
                            <button type="submit" className="btn btn-success">เพิ่มแพทย์ใหม่</button>
                        </form>
                    </div>
                    
                    <div className="list-header" style={{marginTop: '2rem'}}>
                        <h4>รายชื่อแพทย์ในคลินิกนี้</h4>
                        <div className="search-bar">
                            <input type="search" id="doctor-search-input" className="input" 
                                   placeholder="ค้นหาแพทย์..."
                                   value={doctorSearchTerm} onChange={(e) => setDoctorSearchTerm(e.target.value)} />
                        </div>
                    </div>
                    
                    {!doctorSearchTerm && (
                        <div id="specialty-tabs" className="specialty-tabs">
                            <button 
                                className={`tab-btn ${activeSpecialty === 'all' ? 'active' : ''}`}
                                onClick={() => setActiveSpecialty('all')}
                            >
                                ทั้งหมด ({selectedClinic.doctors.length})
                            </button>
                            {Object.keys(specialties).sort().map(name => (
                                <button 
                                    key={name}
                                    className={`tab-btn ${activeSpecialty === name ? 'active' : ''}`}
                                    onClick={() => setActiveSpecialty(name)}
                                >
                                    {name} ({specialties[name]})
                                </button>
                            ))}
                        </div>
                    )}

                    <div id="doctor-manage-grid" className="doctor-manage-grid">
                        {filteredDoctors.length === 0 ? (
                            <p className="text-center">ไม่พบข้อมูลแพทย์</p>
                        ) : (
                            filteredDoctors.map(doctor => (
                                <div key={doctor.id} className="doctor-manage-card">
                                    <h4>{doctor.name}</h4>
                                    <p>แผนก: {doctor.specialty || 'N/A'}</p>
                                    <p className="email-text">{doctor.email || 'N/A'}</p>
                                    <div className="actions">
                                        <button className="btn btn-secondary" onClick={() => handleOpenDoctorModal(doctor.id)}>แก้ไข</button>
                                        <button className="btn btn-danger" onClick={() => handleDeleteDoctor(doctor.id)}>ลบ</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    
                </main>
                
                <EditDoctorModal 
                    doctor={currentEditingDoctor}
                    isOpen={isDoctorModalOpen}
                    onClose={handleCloseDoctorModal}
                    onSave={handleSaveDoctorEdit}
                />
            </div>
        );
    }
    return null;
}

export default Clinics;