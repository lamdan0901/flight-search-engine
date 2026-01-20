import { Button, Stack, Typography } from '@mui/material'

export const EmptyState = ({
  title = 'No results yet',
  description = 'Adjust your dates or filters and try again.',
  ctaLabel = 'Adjust filters',
  onCta,
}: {
  title?: string
  description?: string
  ctaLabel?: string
  onCta?: () => void
}) => (
  <Stack spacing={2} alignItems="center" py={6}>
    <Typography variant="h6">{title}</Typography>
    <Typography variant="body2" color="text.secondary">
      {description}
    </Typography>
    {onCta ? (
      <Button variant="outlined" color="primary" onClick={onCta}>
        {ctaLabel}
      </Button>
    ) : null}
  </Stack>
)
