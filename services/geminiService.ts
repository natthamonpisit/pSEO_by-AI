// ---------------------------------------------------------------------------
// [J's Architecture Note]
// 🧱 FACADE SERVICE
//
// ไฟล์นี้ทำหน้าที่เป็น "หน้าด่าน" (Facade) ที่รวบรวมฟังก์ชันจาก Agent ย่อยๆ
// เพื่อให้โค้ดส่วนอื่นของ App (เช่น Generator.tsx) เรียกใช้ผ่าน path เดิมได้เลย
// โดยไม่ต้องแก้ import path ให้วุ่นวาย
// ---------------------------------------------------------------------------

// Export from Core
export * from './gemini/core';

// Export from Agent 1 (Trends)
export * from './gemini/agents/hunter';

// Export from Agent 2 (Specs)
export * from './gemini/agents/clerk';

// Export from Agent 3 & 4 (Analysis & Writing)
export * from './gemini/agents/editor';
