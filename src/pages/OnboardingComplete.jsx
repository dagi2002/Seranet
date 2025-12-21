import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../lib/utils';
import { create, list, get, update, remove } from "@/api/api";
import { Loader2 } from 'lucide-react';

export default function OnboardingComplete() {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    async function completeOnboarding() {
      try {
        const storedData = localStorage.getItem('onboarding_data');
        if (storedData) {
          const formData = JSON.parse(storedData);
          await api.Merchant.create(formData);
          localStorage.removeItem('onboarding_data');
        }
        navigate(createPageUrl('Dashboard'));
      } catch (error) {
        console.error('Error completing onboarding:', error);
        navigate(createPageUrl('Onboarding'));
      }
    }
    completeOnboarding();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
        <p className="text-slate-600">Setting up your store...</p>
      </div>
    </div>
  );
}
