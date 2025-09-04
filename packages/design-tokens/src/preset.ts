import type { Config } from 'tailwindcss';
import { colors, typography, spacing, borderRadius, shadows } from './tokens';

const designTokens: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        primary: colors.primary,
        secondary: colors.secondary,
        success: colors.success,
        warning: colors.warning,
        error: colors.error,
        neutral: colors.neutral,
        
        // Semantic color mappings
        background: colors.neutral[50],
        foreground: colors.neutral[950],
        card: colors.neutral[50],
        'card-foreground': colors.neutral[950],
        popover: colors.neutral[50],
        'popover-foreground': colors.neutral[950],
        muted: colors.neutral[100],
        'muted-foreground': colors.neutral[500],
        accent: colors.neutral[100],
        'accent-foreground': colors.neutral[900],
        destructive: colors.error[500],
        'destructive-foreground': colors.neutral[50],
        border: colors.neutral[200],
        input: colors.neutral[200],
        ring: colors.primary[500],
      },
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize as any,
      fontWeight: typography.fontWeight,
      spacing: spacing,
      borderRadius: borderRadius,
      boxShadow: shadows,
    },
  },
  plugins: [],
};

export default designTokens;
export { designTokens };