import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  // 檢查是否有 token
  if (!token) {
    // 沒有 token，導向登入頁面
    return <Navigate to="/login" replace />;
  }
  
  // 有 token，顯示子組件
  return children;
};

export default PrivateRoute;
