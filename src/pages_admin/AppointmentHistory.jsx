import React, { useState, useEffect, useMemo } from 'react';

// Icons
const SearchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
    </svg>
);

const CalendarIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);

const ClockIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);

const UserIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

function AppointmentHistory() {
    const [appointments, setAppointments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = () => {
        // ดึงข้อมูลจากทั้ง requests และ appointments
        const storedRequests = JSON.parse(localStorage.getItem('requests')) || [];
        const storedAppointments = JSON.parse(localStorage.getItem('appointments')) || [];
        
        // แปลง requests ให้เป็นรูปแบบเดียวกับ appointments
        const formattedRequests = storedRequests.map(req => ({
            id: req.id,
            patientName: req.patient?.name || req.patientName || 'ไม่ระบุ',
            patientPhone: req.patient?.phone || req.patientPhone || '-',
            clinicName: req.clinic?.name || req.clinicName || '-',
            doctorName: req.selectedDoctor || req.doctorName || '-',
            specialty: req.selectedSpecialty || req.specialty || '-',
            date: req.date,
            time: req.time,
            status: req.status === 'new' ? 'pending' : (req.status || 'pending'),
            createdAt: req.createdAt || new Date(req.id).toISOString(),
            source: 'requests'
        }));

        // รวมข้อมูลทั้งหมด
        const allAppointments = [...formattedRequests, ...storedAppointments];
        
        // เรียงตามวันที่ล่าสุดก่อน
        const sorted = allAppointments.sort((a, b) => 
            new Date(b.createdAt || b.date || b.id) - new Date(a.createdAt || a.date || a.id)
        );
        setAppointments(sorted);
    };

    const filteredAppointments = useMemo(() => {
        let result = appointments;

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(apt => 
                apt.patientName?.toLowerCase().includes(term) ||
                apt.doctorName?.toLowerCase().includes(term) ||
                apt.clinicName?.toLowerCase().includes(term) ||
                apt.specialty?.toLowerCase().includes(term)
            );
        }

        // Filter by status
        if (statusFilter !== 'all') {
            if (statusFilter === 'pending') {
                result = result.filter(apt => apt.status === 'pending' || apt.status === 'new');
            } else if (statusFilter === 'cancelled') {
                result = result.filter(apt => apt.status === 'cancelled' || apt.status === 'rejected');
            } else {
                result = result.filter(apt => apt.status === statusFilter);
            }
        }

        // Filter by date
        if (dateFilter) {
            result = result.filter(apt => apt.date === dateFilter);
        }

        return result;
    }, [appointments, searchTerm, statusFilter, dateFilter]);

    const getStatusBadge = (status) => {
        const styles = {
            pending: { bg: '#fef3c7', color: '#92400e', text: 'รอยืนยัน' },
            new: { bg: '#fef3c7', color: '#92400e', text: 'รอยืนยัน' },
            confirmed: { bg: '#d1fae5', color: '#065f46', text: 'ยืนยันแล้ว' },
            completed: { bg: '#dbeafe', color: '#1e40af', text: 'เสร็จสิ้น' },
            cancelled: { bg: '#fee2e2', color: '#991b1b', text: 'ยกเลิก' },
            rejected: { bg: '#fee2e2', color: '#991b1b', text: 'ปฏิเสธ' },
        };
        const style = styles[status] || styles.pending;
        return (
            <span style={{
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500',
                backgroundColor: style.bg,
                color: style.color
            }}>
                {style.text}
            </span>
        );
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Statistics
    const stats = useMemo(() => {
        return {
            total: appointments.length,
            pending: appointments.filter(a => a.status === 'pending' || a.status === 'new').length,
            confirmed: appointments.filter(a => a.status === 'confirmed').length,
            completed: appointments.filter(a => a.status === 'completed').length,
            cancelled: appointments.filter(a => a.status === 'cancelled' || a.status === 'rejected').length,
        };
    }, [appointments]);

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Stats Cards - Modern Design */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(5, 1fr)', 
                gap: '16px',
                marginBottom: '24px'
            }}>
                {/* Total */}
                <div style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                    padding: '20px 24px', 
                    borderRadius: '16px', 
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ 
                        position: 'absolute', 
                        right: '-10px', 
                        top: '-10px', 
                        width: '80px', 
                        height: '80px', 
                        background: 'rgba(255,255,255,0.1)', 
                        borderRadius: '50%' 
                    }}></div>
                    <div style={{ fontSize: '42px', fontWeight: '700', marginBottom: '4px', position: 'relative' }}>{stats.total}</div>
                    <div style={{ fontSize: '13px', opacity: 0.9, fontWeight: '500' }}>นัดหมายทั้งหมด</div>
                </div>
                
                {/* Pending */}
                <div style={{ 
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
                    padding: '20px 24px', 
                    borderRadius: '16px', 
                    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ 
                        position: 'absolute', 
                        right: '-10px', 
                        top: '-10px', 
                        width: '80px', 
                        height: '80px', 
                        background: 'rgba(255,255,255,0.1)', 
                        borderRadius: '50%' 
                    }}></div>
                    <div style={{ fontSize: '42px', fontWeight: '700', marginBottom: '4px', position: 'relative' }}>{stats.pending}</div>
                    <div style={{ fontSize: '13px', opacity: 0.9, fontWeight: '500' }}>รอยืนยัน</div>
                </div>
                
                {/* Confirmed */}
                <div style={{ 
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                    padding: '20px 24px', 
                    borderRadius: '16px', 
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ 
                        position: 'absolute', 
                        right: '-10px', 
                        top: '-10px', 
                        width: '80px', 
                        height: '80px', 
                        background: 'rgba(255,255,255,0.1)', 
                        borderRadius: '50%' 
                    }}></div>
                    <div style={{ fontSize: '42px', fontWeight: '700', marginBottom: '4px', position: 'relative' }}>{stats.confirmed}</div>
                    <div style={{ fontSize: '13px', opacity: 0.9, fontWeight: '500' }}>ยืนยันแล้ว</div>
                </div>
                
                {/* Completed */}
                <div style={{ 
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
                    padding: '20px 24px', 
                    borderRadius: '16px', 
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ 
                        position: 'absolute', 
                        right: '-10px', 
                        top: '-10px', 
                        width: '80px', 
                        height: '80px', 
                        background: 'rgba(255,255,255,0.1)', 
                        borderRadius: '50%' 
                    }}></div>
                    <div style={{ fontSize: '42px', fontWeight: '700', marginBottom: '4px', position: 'relative' }}>{stats.completed}</div>
                    <div style={{ fontSize: '13px', opacity: 0.9, fontWeight: '500' }}>เสร็จสิ้น</div>
                </div>
                
                {/* Cancelled */}
                <div style={{ 
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
                    padding: '20px 24px', 
                    borderRadius: '16px', 
                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ 
                        position: 'absolute', 
                        right: '-10px', 
                        top: '-10px', 
                        width: '80px', 
                        height: '80px', 
                        background: 'rgba(255,255,255,0.1)', 
                        borderRadius: '50%' 
                    }}></div>
                    <div style={{ fontSize: '42px', fontWeight: '700', marginBottom: '4px', position: 'relative' }}>{stats.cancelled}</div>
                    <div style={{ fontSize: '13px', opacity: 0.9, fontWeight: '500' }}>ยกเลิก</div>
                </div>
            </div>

            {/* Filters - Clean Design */}
            <div style={{ 
                background: 'white', 
                padding: '16px 20px', 
                borderRadius: '12px', 
                marginBottom: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                {/* Search */}
                <div style={{ flex: '1', minWidth: '250px', maxWidth: '500px', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
                        <SearchIcon />
                    </div>
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อคนไข้, แพทย์, คลินิก..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 14px 10px 40px',
                            border: '1.5px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'all 0.2s',
                            backgroundColor: '#f9fafb'
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = '#6366f1';
                            e.target.style.backgroundColor = 'white';
                            e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#e5e7eb';
                            e.target.style.backgroundColor = '#f9fafb';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                </div>

                {/* Filters Group */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                            padding: '10px 36px 10px 14px',
                            border: '1.5px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none',
                            minWidth: '140px',
                            cursor: 'pointer',
                            backgroundColor: '#f9fafb',
                            color: '#374151',
                            appearance: 'none',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 10px center'
                        }}
                    >
                        <option value="all">สถานะทั้งหมด</option>
                        <option value="pending">รอยืนยัน</option>
                        <option value="confirmed">ยืนยันแล้ว</option>
                        <option value="completed">เสร็จสิ้น</option>
                        <option value="cancelled">ยกเลิก</option>
                    </select>

                    {/* Date Filter */}
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        style={{
                            padding: '10px 14px',
                            border: '1.5px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none',
                            cursor: 'pointer',
                            backgroundColor: '#f9fafb',
                            color: '#374151'
                        }}
                    />

                    {/* Clear Filters */}
                    {(searchTerm || statusFilter !== 'all' || dateFilter) && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('all');
                                setDateFilter('');
                            }}
                            style={{
                                padding: '10px 16px',
                                background: '#fee2e2',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '13px',
                                cursor: 'pointer',
                                color: '#dc2626',
                                fontWeight: '500',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#fecaca'}
                            onMouseLeave={(e) => e.target.style.background = '#fee2e2'}
                        >
                            <span>✕</span> ล้าง
                        </button>
                    )}
                </div>
            </div>

            {/* Appointments Table */}
            <div style={{ 
                background: 'white', 
                borderRadius: '16px', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                overflow: 'hidden'
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                                <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>รหัสนัดหมาย</th>
                                <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>คนไข้</th>
                                <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>คลินิก / แพทย์</th>
                                <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>วันที่นัด</th>
                                <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>เวลา</th>
                                <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>สถานะ</th>
                                <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>วันที่สร้าง</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAppointments.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ padding: '60px 20px', textAlign: 'center', color: '#9ca3af' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ 
                                                width: '64px', 
                                                height: '64px', 
                                                borderRadius: '50%', 
                                                background: '#f3f4f6',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                                </svg>
                                            </div>
                                            <p style={{ margin: 0, fontSize: '15px', color: '#6b7280' }}>ไม่พบข้อมูลนัดหมาย</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredAppointments.map((apt, index) => (
                                    <tr 
                                        key={apt.id || index} 
                                        style={{ 
                                            borderBottom: '1px solid #f3f4f6',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafbfc'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                    >
                                        <td style={{ padding: '16px 20px', fontSize: '14px', color: '#1e293b', fontWeight: '600', textAlign: 'center' }}>
                                            <span style={{ 
                                                background: '#f1f5f9', 
                                                padding: '4px 10px', 
                                                borderRadius: '6px',
                                                fontFamily: 'monospace'
                                            }}>
                                                #{apt.id?.toString().slice(-6) || String(index + 1).padStart(6, '0')}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#4f46e5',
                                                    fontWeight: '600',
                                                    fontSize: '14px'
                                                }}>
                                                    {apt.patientName?.charAt(0)?.toUpperCase() || 'U'}
                                                </div>
                                                <div style={{ textAlign: 'left' }}>
                                                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>
                                                        {apt.patientName || 'ไม่ระบุชื่อ'}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                                                        {apt.patientPhone || apt.phone || '-'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>
                                                {apt.clinicName || '-'}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                                                {apt.doctorName || apt.specialty || '-'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#1e293b' }}>
                                                <CalendarIcon />
                                                {formatDate(apt.date)}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#1e293b' }}>
                                                <ClockIcon />
                                                {apt.time || '-'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                            {getStatusBadge(apt.status)}
                                        </td>
                                        <td style={{ padding: '16px 20px', fontSize: '13px', color: '#9ca3af', textAlign: 'center' }}>
                                            {formatDate(apt.createdAt)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Result count */}
            <div style={{ 
                marginTop: '20px', 
                fontSize: '14px', 
                color: '#64748b', 
                textAlign: 'right',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '8px'
            }}>
                <span>แสดง</span>
                <span style={{ fontWeight: '600', color: '#3b82f6' }}>{filteredAppointments.length}</span>
                <span>จาก</span>
                <span style={{ fontWeight: '600', color: '#1e293b' }}>{appointments.length}</span>
                <span>รายการ</span>
            </div>
        </div>
    );
}

export default AppointmentHistory;
