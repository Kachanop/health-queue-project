import React, { createContext, useContext } from 'react';

// คำแปลภาษาไทย
const translations = {
  // Navbar Patient
  home: 'หน้าหลัก',
  appointments: 'นัดหมาย',
  notifications: 'แจ้งเตือน',
  chat: 'แชท',
  profile: 'โปรไฟล์',
  
  // Navbar Admin
  clinics: 'คลินิก',
  
  // Common
  login: 'เข้าสู่ระบบ',
  logout: 'ออกจากระบบ',
  save: 'บันทึก',
  cancel: 'ยกเลิก',
  search: 'ค้นหา',
  settings: 'ตั้งค่า',
  language: 'ภาษา',
  back: 'กลับ',
  next: 'ถัดไป',
  previous: 'ก่อนหน้า',
  confirm: 'ยืนยัน',
  edit: 'แก้ไข',
  delete: 'ลบ',
  close: 'ปิด',
  loading: 'กำลังโหลด...',
  
  // Home Page
  welcomeMessage: 'สวัสดี',
  findClinic: 'ค้นหาคลินิก',
  bookOnline: 'นัดหมอ ออนไลน์ไม่ต้องรอนาน',
  searchPlaceholder: 'ชื่อหมอ , ชื่อโรงพยาบาล, ...',
  searchHint: 'พิมพ์ชื่อหมอหรือโรงพยาบาลที่คุณต้องการค้นหาในช่องค้นหา',
  selectHospital: 'เลือกโรงพยาบาล / คลินิกที่คุณต้องการเข้ารับบริการ',
  selectedHospital: 'โรงพยาบาลที่เลือก',
  searchResults: 'ผลลัพธ์การค้นหา',
  noClinicFound: 'ไม่พบข้อมูลคลินิก',
  trySelectAll: 'ลองเลือก Tab "ทั้งหมด" หรือเปลี่ยนคำค้นหา',
  allDoctors: 'แพทย์',
  departmentsAndHospitals: 'แผนกและโรงพยาบาล',
  all: 'ทั้งหมด',
  noDepartment: 'ยังไม่มีข้อมูลแผนก',
  
  // Appointments
  myAppointments: 'การนัดหมายของฉัน',
  noAppointments: 'คุณยังไม่มีรายการนัดหมาย',
  bookAppointment: 'จองนัดหมาย',
  pendingAppointments: 'นัดหมายที่รอดำเนินการ',
  appointmentHistory: 'ประวัติการนัดหมาย',
  confirmed: 'ยืนยันแล้ว',
  rejected: 'ถูกปฏิเสธ',
  pending: 'รอดำเนินการ',
  doctor: 'แพทย์',
  clinic: 'คลินิก',
  dateTime: 'วัน-เวลา',
  reason: 'เหตุผล',
  status: 'สถานะ',
  
  // Appointment Detail Modal
  appointmentInfo: 'ข้อมูลการนัดหมาย',
  packageService: 'รายการ',
  initialSymptoms: 'อาการเบื้องต้นที่แจ้ง',
  adminReason: 'เหตุผลจากแอดมิน',
  advice: 'คำแนะนำ',
  arriveEarly: 'กรุณามาถึงโรงพยาบาลก่อนเวลานัด 15 นาที',
  yourHealthInfo: 'ข้อมูลสุขภาพของคุณ (ณ วันที่จอง)',
  ageGender: 'อายุ/เพศ',
  heightWeight: 'ส่วนสูง/น้ำหนัก',
  chronicDiseases: 'โรคประจำตัว',
  drugAllergies: 'แพ้ยา',
  none: 'ไม่มี',
  years: 'ปี',
  cm: 'ซม.',
  kg: 'กก.',
  
  // Profile
  editProfile: 'แก้ไขโปรไฟล์',
  healthInfo: 'ข้อมูลสุขภาพ',
  age: 'อายุ',
  gender: 'เพศ',
  height: 'ส่วนสูง',
  weight: 'น้ำหนัก',
  noData: 'ไม่มีข้อมูล',
  idCard: 'เลขบัตรประชาชน',
  name: 'ชื่อ-นามสกุล',
  saveData: 'บันทึกข้อมูล',
  accountSettings: 'การตั้งค่าบัญชี',
  accountEmailId: 'บัญชี (อีเมล, เลขบัตร)',
  changePassword: 'เปลี่ยนรหัสผ่าน',
  deleteAccount: 'ปิดบัญชีถาวร',
  confirmLogout: 'คุณต้องการออกจากระบบใช่หรือไม่?',
  confirmDeleteAccount: 'คุณแน่ใจหรือไม่ว่าต้องการ "ปิดบัญชีถาวร"?',
  accountDeleted: 'บัญชีของคุณถูกลบเรียบร้อยแล้ว',
  profileSaved: 'บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว',
  male: 'ชาย',
  female: 'หญิง',
  other: 'อื่นๆ',
  notSpecified: 'ไม่ระบุ',
  
  // Notifications
  notificationList: 'รายการแจ้งเตือนล่าสุด',
  noNotifications: 'คุณยังไม่มีการแจ้งเตือน',
  systemUpdate: 'ข่าวสารอัพเดท',
  appointmentConfirmed: 'ยืนยันนัดหมาย',
  appointmentRejected: 'ปฏิเสธนัดหมาย',
  notification: 'แจ้งเตือน',
  atDateTime: 'ณ วันที่',
  time: 'เวลา',
  updateMessage: 'มีการอัพเดท',
  
  // Chat
  chatWithStaff: 'แชทกับเจ้าหน้าที่',
  online: 'ออนไลน์',
  askQuestion: 'สอบถามข้อมูล...',
  welcomeChat: 'สวัสดีค่ะ หนูเป็นโรบ็อต ชื่อน้องนัดดีค่ะ มีอะไรให้ช่วยไหมค่ะ',
  autoReply: 'คุณลูกค้าสามารถนัดหมอคลินิกที่อยู่บนเว็บนัดหมอ ได้ทุกคลินิกเลยนะคะ',
  
  // Clinic Detail / Booking
  makeAppointment: 'ทำนัด',
  hospital: 'รพ.',
  start: 'เริ่มต้น',
  appointmentData: 'ข้อมูลนัด',
  patientData: 'ข้อมูลผู้ป่วย',
  waitConfirm: 'รอยืนยัน',
  selectAppointmentType: 'กรุณาเลือกประเภทการนัด',
  doctorAppointment: 'นัดหมายแพทย์',
  healthCheck: 'ตรวจสุขภาพ',
  newTreatment: '-',
  selectDoctor: 'เลือกแพทย์',
  autoSelectDoctor: 'เลือกแพทย์ให้ตลอด',
  selectOwnDoctor: 'ต้องการเลือกแพทย์เอง',
  specialty: 'ความชำนาญเฉพาะทางสาขา',
  selectDoctorSpecialty: 'เลือกความชำนาญของแพทย์',
  aiRecommend: 'ให้ AI แนะนำแพทย์สำหรับฉัน',
  notSure: 'ไม่แน่ใจ',
  clickToSelectSpecialty: 'คลิกเพื่อเลือกความชำนาญของแพทย์',
  selected: 'เลือกแล้ว',
  noDoctorInClinic: 'ยังไม่มีแพทย์ในคลินิกนี้',
  desiredDateTime: 'วันเวลาที่ต้องการนัด',
  timeSlot: 'ช่วงเวลา',
  morning: 'ก่อนเที่ยง',
  afternoon: 'หลังเที่ยง',
  symptomsAndHealth: 'อาการและข้อมูลสุขภาพของคุณ',
  attachFile: 'แนบไฟล์เอกสาร, รูปภาพ (ถ้ามี)',
  fileLimit: 'ไฟล์ที่แนบได้ 3 MB (PDF/JPG/PNG)',
  attachedFiles: 'ไฟล์ที่แนบ',
  relationship: 'ความสัมพันธ์',
  title: 'คำนำหน้า',
  mr: 'นาย',
  mrs: 'นาง',
  miss: 'นางสาว',
  self: 'ตนเอง',
  family: 'ครอบครัว',
  friend: 'เพื่อน',
  firstName: 'ชื่อ',
  lastName: 'นามสกุล',
  birthDate: 'วันเกิด',
  phone: 'เบอร์โทรศัพท์มือถือ',
  nationality: 'สัญชาติ',
  thai: 'ไทย',
  email: 'อีเมล',
  confirmSuccess: 'ยืนยันการนัดหมายสำเร็จ!',
  confirmMessage: 'ระบบได้บันทึกข้อมูลและส่งเมลยืนยันแล้ว กรุณาตรวจสอบเมลและรอเจ้าหน้าที่ติดต่อกลับ',
  appointmentSummary: 'สรุปการนัดหมาย',
  bookerName: 'ชื่อผู้นัดหมาย/ผู้ป่วย',
  contactPhone: 'เบอร์โทรศัพท์ติดต่อ',
  backToHome: 'กลับหน้าหลัก',
  pleaseSelectDateAndTime: 'กรุณาเลือกวันที่และเวลา',
  pleaseSelectDoctor: 'กรุณาเลือกแพทย์',
  pleaseSelectSpecialty: 'กรุณาเลือกความชำนาญเฉพาะทางสาขา',
  pleaseSelectDoctorSpecialty: 'กรุณาเลือกความชำนาญของแพทย์',
  pleaseSelectDoctorMethod: 'กรุณาเลือกวิธีการเลือกแพทย์',
  pleaseFillAllInfo: 'กรุณากรอกข้อมูลให้ครบถ้วน',
  pleaseLogin: 'กรุณาล็อกอินก่อนทำการจองนัดหมาย',
  adminCannotBook: 'แอดมินไม่สามารถจองนัดหมายได้',
  clinicNotFound: 'เกิดข้อผิดพลาด: ไม่พบข้อมูลคลินิก',
  
  // Appointment Rounds
  selectedAppointmentRounds: 'รอบนัดหมายที่เลือก',
  round: 'รอบ',
  primary: 'หลัก',
  atTime: 'เวลา',
  
  // Login/Register
  loginTitle: 'เข้าสู่ระบบ Health Queue',
  loginDesc: 'โปรดเข้าสู่ระบบด้วยบัญชีที่คุณได้เคยสมัครไว้บนเว็บไซต์',
  password: 'รหัสผ่าน',
  enterPassword: 'กรอกรหัสผ่าน',
  noAccount: 'ยังไม่มีบัญชี?',
  registerHere: 'สมัครสมาชิกที่นี่',
  register: 'สมัครสมาชิก',
  step1AccountInfo: 'ขั้นตอนที่ 1: ข้อมูลบัญชี',
  step2HealthInfo: 'ขั้นตอนที่ 2: ข้อมูลสุขภาพ',
  accountInfo: 'ข้อมูลบัญชี',
  emailGmailOnly: 'อีเมล (@gmail.com เท่านั้น)',
  idCard13: 'เลขบัตรประชาชน (13 หลัก)',
  passwordMin6: 'รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)',
  chronicDiseasesOptional: 'โรคประจำตัว (ถ้าไม่มีให้เว้นว่าง)',
  drugAllergiesOptional: 'ประวัติการแพ้ยา (ถ้าไม่มีให้เว้นว่าง)',
  haveAccount: 'มีบัญชีอยู่แล้ว?',
  loginHere: 'เข้าสู่ระบบที่นี่',
  registerSuccess: 'สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ',
  emailAlreadyUsed: 'อีเมลนี้ถูกใช้งานแล้ว',
  fillAllAccountInfo: 'กรุณากรอกข้อมูลบัญชีให้ครบทุกช่อง',
  useGmailOnly: 'กรุณาใช้อีเมล @gmail.com เท่านั้น',
  idCard13Required: 'เลขบัตรประชาชนต้องมี 13 หลัก',
  passwordMin6Required: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
  userNotFound: 'ไม่พบบัญชีผู้ใช้งานนี้',
  wrongPassword: 'รหัสผ่านไม่ถูกต้อง',
  generalUserGmailOnly: 'กรุณาเข้าสู่ระบบด้วยอีเมล @gmail.com เท่านั้น',
  
  // Specialties
  heart: 'หัวใจ',
  cancer: 'มะเร็ง',
  bone: 'กระดูก',
  eyeEar: 'ตาหู',
  skin: 'ผิวหนัง',
  generalCheckup: 'ตรวจสุขภาพทั่วไป',
  surgery: 'ศัลยกรรม',
  dental: 'ทันตกรรม',
  womenElderly: 'สตรีและผู้สูงอายุ',
  noseSmell: 'หู คอ จมูก',
  beauty: 'ความงาม',
  hearing: 'การได้ยิน',
  rehabilitation: 'เวชศาสตร์ฟื้นฟู',
  digestiveLiver: 'ระบบย่อยอาหารและตับ',
  neurologyBrain: 'ระบบประสาทและสมอง',
  pediatrics: 'กุมารเวชกรรม',
  familyMedicine: 'เวชศาสตร์ครอบครัว',
  elderlyPathology: 'ผู้สูงอายุและพยาธิวิทยา',
  respiratoryMedicine: 'ระบบทางเดินหายใจ',
  others: 'อื่นๆ',
  
  // Calendar
  monthNames: ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'],
  dayNames: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'],
  
  // Feature not available
  featureNotAvailable: 'ฟังก์ชันนี้ยังไม่เปิดใช้งาน',
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const t = (key) => {
    return translations[key] || key;
  };

  const value = {
    language: 'th',
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;
