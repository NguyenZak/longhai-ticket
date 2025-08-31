'use client';

import React from 'react';
import SeatMapEditor from '@/components/seating';
import '@/styles/seating-editor.css';
import { useEffect } from 'react';

const SeatingPage: React.FC = () => {
  useEffect(() => {
    // No longer auto-hydrating SeatEditor from sidebar; kept page lean
  }, []);

  return (
    <SeatMapEditor />
  );
};

export default SeatingPage; 