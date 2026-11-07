import { useTheme } from 'next-themes';

export const presetLight = {
  lighter: '#f1f1f1',
  light: '#666666',
  default: '#111111',
  dark: '#000000',
};

export const presetDark = {
  lighter: '#222222',
  light: '#929292',
  default: '#f1f1f1',
  dark: '#ffffff',
};

// defaults — Home Healers royal blue (from logo #143087)
export const DEFAULT_PRESET_COLORS = {
  lighter: '#E8ECF5',
  light: '#39519B',
  default: '#143087',
  dark: '#0F2466',
};

export const DEFAULT_PRESET_COLOR_NAME = 'Home Healers';

export const usePresets = () => {
  const { theme } = useTheme();

  return [
    {
      name: DEFAULT_PRESET_COLOR_NAME,
      colors: DEFAULT_PRESET_COLORS,
    },
    {
      name: 'Black',
      colors: {
        lighter: theme === 'light' ? presetLight.lighter : presetDark.lighter,
        light: theme === 'light' ? presetLight.light : presetDark.light,
        default: theme === 'light' ? presetLight.default : presetDark.default,
        dark: theme === 'light' ? presetLight.dark : presetDark.dark,
      },
    },
    {
      name: 'Teal Soft',
      colors: {
        lighter: '#ccfbf1',
        light: '#5eead4',
        default: '#0d9488',
        dark: '#115e59',
      },
    },
    {
      name: 'Violet',
      colors: {
        lighter: '#ede9fe',
        light: '#a5b4fc',
        default: '#7c3aed',
        dark: '#4c1d95',
      },
    },
    {
      name: 'Rose',
      colors: {
        lighter: '#ffe4e6',
        light: '#fda4af',
        default: '#e11d48',
        dark: '#881337',
      },
    },
    {
      name: 'Yellow',
      colors: {
        lighter: '#fef9c3',
        light: '#fde047',
        default: '#ca8a04',
        dark: '#854d0e',
      },
    },
  ];
};
