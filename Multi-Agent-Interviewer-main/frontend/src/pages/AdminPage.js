import React from 'react';
import Header from '../components/common/Header';
import AdminDashboard from '../components/admin/AdminDashboard';

const AdminPage = () => {
  return (
    <>
      <Header userType="admin" />
      <main className="main-content">
        <AdminDashboard />
      </main>
    </>
  );
};

export default AdminPage;