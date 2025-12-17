import { DialogContent, DialogActions, Button, Stack, Typography, Divider } from '@mui/material'
import { ExternalLink } from './ExternalLink'
import { METADATA } from '@/constants/siteMetadata'
import { useSentryBlockDetection } from '@/hooks/useSentryBlockDetection'

interface AboutDialogContentProps {
  onClose: () => void
  onFeedbackMode: () => void
}

export const AboutDialogContent = ({ onClose, onFeedbackMode }: AboutDialogContentProps) => {
  const { isSentryBlocked } = useSentryBlockDetection()

  return (
    <>
      <DialogContent>
        <Stack spacing={1.5}>
          <Typography variant="body2">
            Data source: <ExternalLink href="https://hsba.org/member-directory">HSBA Member Directory</ExternalLink>
          </Typography>

          <Typography color="text.secondary" variant="body2">
            Disclaimer: Data may be incorrect or incomplete.
          </Typography>

          <Typography variant="body2">
            License information:{' '}
            <ExternalLink href="https://legacy.sailamx.com/hsba/images/HSBA/MembershipStatus.pdf">
              HSBA Membership Status
            </ExternalLink>
          </Typography>
        </Stack>

        <Divider sx={{ my: 2.5 }} />

        <Stack spacing={1.5}>
          <Typography variant="body2">
            Independently maintained by: <ExternalLink href={METADATA.author.url}>{METADATA.author.name}</ExternalLink>
          </Typography>

          <Typography variant="body2">Last updated: December 16, 2025</Typography>
        </Stack>
      </DialogContent>

      <DialogActions>
        {isSentryBlocked === false && (
          <Button onClick={onFeedbackMode} size="small">
            Leave Feedback
          </Button>
        )}

        <Button onClick={onClose} size="small">
          Close
        </Button>
      </DialogActions>
    </>
  )
}
