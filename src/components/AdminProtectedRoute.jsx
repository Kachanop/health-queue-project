import React from 'react';
import { useLocation, Navigate, Outlet } from 'react-router-dom';

/**
 * (ยาม) สำหรับตรวจสอบว่า "เป็นแอดมินหรือไม่"
 */
function AdminProtectedRoute() {
  const location = useLocation();
  
  // 🔹 [FIX] 🔹 อ่านจาก sessionStorage
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

  if (!currentUser || currentUser.role !== 'admin') {
    // 🔹 ถ้าไม่ใช่แอดมิน:
    // 1. ส่งไปหน้า Login, "จำ" หน้าที่พยายามจะเข้าไว้
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 🔹 ถ้าเป็นแอดมิน:
  // ให้แสดงหน้าที่ร้องขอ (เช่น HomeAdmin, Clinics)
  return <Outlet />;
}

export default AdminProtectedRoute;