import { CircularProgress, Stack, Typography } from '@mui/material'

export const LoadingState = ({ message = 'Loading flights...' }: { message?: string }) => (
  <Stack spacing={2} alignItems="center" py={6}>
    <CircularProgress color="primary" />
    <Typography variant="body1" color="text.secondary">
      {message}
    </Typography>
  </Stack>
)
