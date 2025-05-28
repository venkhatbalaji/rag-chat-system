import 'styled-components';
import '@emotion/react';
import { AppTheme } from './src/components/theme';

declare module '@emotion/react' {
  export interface Theme extends AppTheme {}
}
