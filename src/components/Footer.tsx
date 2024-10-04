import { AboutContent } from './AboutContent'
import { Button, Dialog, Skeleton, Typography, Snackbar } from '@mui/material'
import { captureFeedback } from '@sentry/react'
import { FC, SyntheticEvent, useState } from 'react'
import { FeedbackForm } from './FeedbackForm'
import {
  gridFilteredTopLevelRowCountSelector,
  GridFooterContainer,
  useGridApiContext,
  useGridSelector
} from '@mui/x-data-grid-pro'
import { SnackbarCloseButton } from './SnackbarCloseButton'
import { useLoadingContext } from '../hooks/useLoadingContext'

export const Footer: FC = () => {
  const [email, setEmail] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isFeedbackMode, setIsFeedbackMode] = useState(false)
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [name, setName] = useState('')

  const { isLoading } = useLoadingContext()

  const apiRef = useGridApiContext()
  const totalRowCount = useGridSelector(apiRef, gridFilteredTopLevelRowCountSelector)

  const handleClickOpen = () => setIsDialogOpen(true)

  const handleClose = () => {
    setEmail('')
    setMessage('')
    setName('')
    setIsDialogOpen(false)

    // Prevent <AboutContent> from flickering into view during <Dialog> close transition.
    setTimeout(() => setIsFeedbackMode(false), 225)
  }

  const handleFeedbackMode = () => setIsFeedbackMode(true)

  const handleSnackbarClose = (_?: SyntheticEvent | Event, reason?: string) =>
    reason !== 'clickaway' && setIsSnackbarOpen(false)

  const handleSubmitFeedback = async () => {
    captureFeedback({ email, message, name }, { includeReplay: true })

    setIsSnackbarOpen(true)

    handleClose()
  }

  return (
    <GridFooterContainer
      sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', pl: 1.25, pr: 1, py: 1 }}
    >
      {isLoading ? (
        <Skeleton sx={{ height: 24, ml: 0.25, width: 125 }} />
      ) : (
        <Typography variant="body2">Total Rows: {totalRowCount}</Typography>
      )}

      <Button onClick={handleClickOpen} size="small">
        About
      </Button>

      <Dialog
        onClose={handleClose}
        open={isDialogOpen}
        PaperProps={{ sx: { bottom: 10, m: 0, minWidth: { xs: 359 }, position: 'fixed', right: 8 } }}
      >
        {isFeedbackMode ? (
          <FeedbackForm
            email={email}
            message={message}
            name={name}
            onCancel={handleClose}
            onSubmit={handleSubmitFeedback}
            setEmail={setEmail}
            setMessage={setMessage}
            setName={setName}
          />
        ) : (
          <AboutContent onClose={handleClose} onFeedbackMode={handleFeedbackMode} />
        )}
      </Dialog>

      <Snackbar
        action={<SnackbarCloseButton onClose={handleSnackbarClose} />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        open={isSnackbarOpen}
        message="Thank you for your feedback!"
        sx={{ bottom: '10px !important', right: '8px !important' }}
      />
    </GridFooterContainer>
  )
}
