import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { apiClient } from '@/api/apiClient';
import { LoadingScreen } from '@/components/shared/loading-screen';
import { useAuth } from '@/hooks/auth';
import { queryClient } from '@/lib/query-client';
import { removeStorage, readStorage, STORAGE_KEYS } from '@/services/storage';
import type { RegisterInput } from '@/types/seranet';

let onboardingSetup:
  | {
      key: string;
      promise: Promise<void>;
    }
  | null = null;

export default function OnboardingCompletePage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  useEffect(() => {
    let active = true;

    const setup = async () => {
      const onboardingData = readStorage<Record<string, string> | null>(STORAGE_KEYS.onboarding, null);
      if (!onboardingData) {
        navigate('/onboarding', { replace: true });
        return;
      }

      const setupKey = `${onboardingData.email.trim().toLowerCase()}::${onboardingData.store_url_slug}`;

      try {
        const payload: RegisterInput = {
          full_name: onboardingData.owner_name || onboardingData.business_name,
          email: onboardingData.email.trim().toLowerCase(),
          password: onboardingData.password,
          merchant: {
            business_name: onboardingData.business_name,
            owner_name: onboardingData.owner_name,
            phone: onboardingData.phone,
            store_url_slug: onboardingData.store_url_slug,
            description: onboardingData.description,
            logo_url: onboardingData.logo_url,
          },
        };

        if (!onboardingSetup || onboardingSetup.key !== setupKey) {
          onboardingSetup = {
            key: setupKey,
            promise: (async () => {
              const existingUser = await apiClient.auth.me();
              const existingMerchant = await apiClient.merchants.getCurrent();

              if (
                existingUser?.email !== payload.email ||
                existingMerchant?.store_url_slug !== payload.merchant.store_url_slug
              ) {
                await register(payload);
              }

              removeStorage(STORAGE_KEYS.onboarding);
              await queryClient.invalidateQueries({ queryKey: ['current-merchant'] });
            })(),
          };
        }

        await onboardingSetup.promise;
        if (active) {
          toast.success('Store created');
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        if (onboardingSetup?.key === setupKey) {
          onboardingSetup = null;
        }
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
  }, [navigate, register]);

  return <LoadingScreen message="Setting up your store..." />;
}
