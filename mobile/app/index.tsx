import { Redirect } from 'expo-router';
import { AppScreen } from '../src/components/AppScreen';
import { EmptyState } from '../src/components/EmptyState';
import { env, getEnvError } from '../src/config/env';
import { ThemeText } from '../src/components/ui/ThemeText';

export default function IndexScreen() {
  if (!env) {
    return (
      <AppScreen>
        <EmptyState
          iconName="alert-circle"
          title="Mobile env is not configured"
          description={getEnvError() ?? 'Set EXPO_PUBLIC_API_BASE_URL and EXPO_PUBLIC_DEFAULT_STORE_SLUG to boot the app.'}
          action={<ThemeText muted>Check `mobile/.env.example` for the expected keys.</ThemeText>}
        />
      </AppScreen>
    );
  }

  return <Redirect href={{ pathname: '/store/[slug]', params: { slug: env.EXPO_PUBLIC_DEFAULT_STORE_SLUG } }} />;
}
