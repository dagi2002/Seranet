import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { apiClient } from '@/api/apiClient';
import { LoadingScreen } from '@/components/shared/loading-screen';
import { queryClient } from '@/lib/query-client';
import { removeStorage, readStorage, STORAGE_KEYS } from '@/services/storage';

export default function OnboardingCompletePage() {
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    const setup = async () => {
      const onboardingData = readStorage<Record<string, string> | null>(STORAGE_KEYS.onboarding, null);
      if (!onboardingData) {
        navigate('/onboarding', { replace: true });
        return;
      }

      try {
        const user = await apiClient.auth.me();
        await apiClient.entities.Merchant.create({
          ...onboardingData,
          created_by: user?.email,
        });
        removeStorage(STORAGE_KEYS.onboarding);
        await queryClient.invalidateQueries({ queryKey: ['current-merchant'] });
        if (active) {
          toast.success('Store created');
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        if (active) {
          toast.error(error instanceof Error ? error.message : 'Could not set up your store');
          navigate('/onboarding', { replace: true });
        }
      }
    };

    void setup();

    return () => {
      active = false;
    };
  }, [navigate]);

  return <LoadingScreen message="Setting up your store..." />;
}
