import '@mui/material/Grid';
import { SystemProps } from '@mui/system';

declare module '@mui/material/Grid' {
  interface GridProps extends SystemProps {
    item?: boolean;
    container?: boolean;
    zeroMinWidth?: boolean;
    wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  }
}