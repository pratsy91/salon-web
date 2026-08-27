import { Dialog, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

/** Dialog that goes full-screen below the `sm` breakpoint. */
export default function ResponsiveDialog({ children, fullScreen, ...props }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog fullScreen={fullScreen ?? isMobile} {...props}>
      {children}
    </Dialog>
  );
}
