import React, { useRef } from 'react';
import {
  Box,
  Avatar,
  Button,
  Divider,
  Typography,
  Stack,
} from '@mui/material';
import {
  AccountPreview,
  SignOutButton,
  AccountPopoverFooter,
} from '@toolpad/core/Account';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';

import auth from '../Auth';

export default function AccountSwitcher() {
  const appUrl = useRef(window.location.origin);

  const handleSwitchAccount = () => {
    auth.getUser().keycloak.logout({
      redirectUri: `${appUrl.current}/#/login?redirect=/home`,
    });
  };
   
  return (
    <Stack direction="column">
      <AccountPreview variant="expanded" />
      <Stack mb={1}>
        <Typography textAlign="center" fontSize="0.625rem" gutterBottom>
          This user belongs to group:
        </Typography>
        <Box display="flex" justifyContent="center" alignItems="center" gap={2}>
          <Typography variant="body2" color="textSecondary">
            {auth.getUserGroups().join(', ')}
          </Typography>
        </Box>
        <Divider />
        <Button
          variant="text"
          sx={{ textTransform: 'capitalize', display: 'flex', mx: 'auto' }}
          size="small"
          startIcon={<SwitchAccountIcon />}
          disableElevation
          onClick={handleSwitchAccount}
          >
          Switch User
        </Button>
      </Stack>
      <Divider />
      <AccountPopoverFooter>
        <SignOutButton />
      </AccountPopoverFooter>
    </Stack>
  );
}