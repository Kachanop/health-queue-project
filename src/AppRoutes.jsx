import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// --- Guards (ยาม) ---
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';

// --- Layouts (หน้าต่างหลัก) ---
import PatientLayout from './PatientLayout';
import AdminLayout from './AdminLayout';

// --- Auth Page (หน้า Login) ---
import Login from './Login/Login';

// --- Patient Pages (หน้าของคนไข้) ---
import Home from './pages_patient/Home';
import ClinicDetail from './pages_patient/ClinicDetail';
import MyAppointments from './pages_patient/MyAppointments';
import Profile from './pages_patient/Profile';
import Notifications from './pages_patient/Notifications';

// --- Admin Pages (หน้าของแอดมิน) ---
import HomeAdmin from './pages_admin/HomeAdmin';
import Clinics from './pages_admin/Clinics';
import Appointments from './pages_admin/Appointments';
import ProfileAdmin from './pages_admin/Profileadmin';

function AppRoutes() {
  return (
    <Routes>
      {/* --- 1. หน้า Login --- */}
      <Route path="/login" element={<Login />} />
      
      {/* 🔹 [FIX] หน้าแรก ให้ไปที่หน้า Home ของคนไข้ (แบบสาธารณะ) 🔹 */}
      <Route path="/" element={<Navigate replace to="/patient/home" />} />

      {/* --- 2. เส้นทางของคนไข้ (หุ้มด้วย Layout) --- */}
      <Route path="/patient" element={<PatientLayout />}>
        
        {/* (index คือ path เริ่มต้น /patient) */}
        <Route index element={<Navigate replace to="home" />} /> 

        {/* 2a. หน้าสาธารณะ (ที่คนไม่ได้ล็อกอินก็ดูได้) */}
        
        {/* 🔹 (นี่คือหน้าหลักคนไข้ที่ถูกต้อง) 🔹 */}
        <Route path="home" element={<Home />} /> 
        <Route path="clinic-detail" element={<ClinicDetail />} />

        {/* 2b. หน้าที่ต้องล็อกอิน (หุ้มด้วย ProtectedRoute) */}
        <Route element={<ProtectedRoute />}>
          <Route path="appointments" element={<MyAppointments />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>
      
      {/* --- 3. เส้นทางของแอดมิน (หุ้มด้วย AdminProtectedRoute) --- */}
      <Route path="/admin" element={<AdminProtectedRoute />}>
        {/* (เมื่อผ่านยามมาได้ ก็ให้แสดง Layout ของแอดมิน) */}
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate replace to="home" />} />
          
          {/* 🔹 (นี่คือหน้าหลักแอดมินที่ถูกต้อง) 🔹 */}
          <Route path="home" element={<HomeAdmin />} />
          
          <Route path="clinics" element={<Clinics />} />
          <Route path="appointments" element={<Appointments />} /> 
          <Route path="profile" element={<ProfileAdmin />} />
        </Route>
      </Route>
      
      {/* --- 4. ถ้าเข้า URL มั่วๆ --- */}
      <Route path="*" element={<Navigate replace to="/patient/home" />} />
    </Routes>
  );
}
export default AppRoutes;