import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Redirect to main login page
export default function Autenticacion() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(createPageUrl('login'), { replace: true });
  }, [navigate]);

  return null;
}
