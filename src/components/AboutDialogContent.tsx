import { FC } from 'react'
import { DialogContent, DialogActions, Button, Stack, Typography, Divider } from '@mui/material'
import { ExternalLink } from './ExternalLink'
import { useSentryBlockDetection } from '../hooks/useSentryBlockDetection'

interface AboutDialogContentProps {
  onClose: () => void
  onFeedbackMode: () => void
}

export const AboutDialogContent: FC<AboutDialogContentProps> = ({ onClose, onFeedbackMode }) => {
  const { isSentryBlocked } = useSentryBlockDetection()

  return (
    <>
      <DialogContent>
        <Stack spacing={1.5}>
          <Typography variant="body2">
            Data source:{' '}
            <ExternalLink href="https://hsba.org/HSBA_2020/For_the_Public/Find_a_Lawyer/HSBA_2020/Public/Find_a_Lawyer.aspx">
              HSBA Member Directory
            </ExternalLink>
          </Typography>

          <Typography variant="body2">
            License types:{' '}
            <ExternalLink href="https://hsba.org/images/HSBA/MembershipStatus.pdf">HSBA Membership Status</ExternalLink>
          </Typography>
        </Stack>

        <Divider sx={{ my: 2.5 }} />

        <Stack spacing={1.5}>
          <Typography variant="body2">Independently maintained by: Bronson Avila</Typography>

          <Typography variant="body2">Last updated: Sep. 30, 2024</Typography>
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
