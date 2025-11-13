import React from 'react';
import AppRoutes from './AppRoutes';

function App() {
  return (
    <div className="app-wrapper">
      {/* AppRoutes จะเป็นตัวตัดสินใจว่า 
        URL นี้ควรจะแสดงหน้า Login, หน้า Home, หรือหน้า Admin 
      */}
      <AppRoutes />
    </div>
  );
}

export default App;