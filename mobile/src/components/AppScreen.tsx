import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, layout } from '../theme/theme';

type AppScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  footer?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  scrollContentStyle?: StyleProp<ViewStyle>;
};

export function AppScreen({ children, scroll = false, footer, contentStyle, scrollContentStyle }: AppScreenProps) {
  const content = <View style={[styles.content, contentStyle]}>{children}</View>;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, scrollContentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: layout.screenPaddingVertical,
    gap: layout.sectionGap,
  },
  footer: {
    position: 'absolute',
    left: layout.screenPaddingHorizontal,
    right: layout.screenPaddingHorizontal,
    bottom: 0,
  },
});
