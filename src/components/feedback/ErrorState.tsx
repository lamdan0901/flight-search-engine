import { Button, Stack, Typography } from '@mui/material'

export const ErrorState = ({
  title = 'Something went wrong',
  description,
  onRetry,
}: {
  title?: string
  description?: string
  onRetry?: () => void
}) => (
  <Stack spacing={2} alignItems="center" py={6}>
    <Typography variant="h6">{title}</Typography>
    {description ? (
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    ) : null}
    {onRetry ? (
      <Button variant="contained" color="secondary" onClick={onRetry}>
        Retry search
      </Button>
    ) : null}
  </Stack>
)
