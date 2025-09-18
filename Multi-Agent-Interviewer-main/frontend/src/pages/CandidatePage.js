import React from 'react';
import Header from '../components/common/Header';
import CandidateDashboard from '../components/candidate/CandidateDashboard';

const CandidatePage = () => {
  return (
    <>
      <Header userType="candidate" />
      <main className="main-content">
        <CandidateDashboard />
      </main>
    </>
  );
};

export default CandidatePage;