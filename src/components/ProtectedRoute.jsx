import React, { useEffect, useRef } from 'react'; // 1. เพิ่ม useRef
import { useLocation, Navigate, Outlet } from 'react-router-dom';

/**
 * (ยาม) สำหรับตรวจสอบว่า "ล็อกอินหรือยัง" (สำหรับคนไข้)
 */
function ProtectedRoute() {
  const location = useLocation();
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

  // 2. 🔹 [FIX] 🔹 เปลี่ยนจาก useState เป็น useRef
  //    (useRef จะเก็บค่าไว้ แม้จะถูก Render ใหม่ใน Strict Mode)
  const alertShownRef = useRef(false);

  // 3. ย้าย Alert เข้ามาใน useEffect
  useEffect(() => {
    
    // 4. ตรวจสอบเงื่อนไข:
    //    (ถ้า "ยังไม่ล็อกอิน" และ "Ref ยังเป็น false")
    if (!currentUser && !alertShownRef.current) {
      
      alert('กรุณาล็อกอินเพื่อเข้าสู่หน้านี้');
      
      // 5. 🔹 [FIX] 🔹 ตั้งค่า .current ของ Ref เป็น true
      //    (นี่คือการตั้งธงว่า "แจ้งเตือนแล้วนะ")
      alertShownRef.current = true; 
    }
  }, [currentUser]); // 6. (ให้ Effect นี้ทำงานเมื่อ currentUser เปลี่ยน)

  
  // 7. ส่วน Render จะทำงานปกติ
  if (!currentUser) {
    // ถ้าไม่ล็อกอิน ก็ส่งไปหน้า Login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ถ้าล็อกอินแล้ว ก็ให้แสดงหน้าลูก (Outlet)
  return <Outlet />;
}

export default ProtectedRoute;