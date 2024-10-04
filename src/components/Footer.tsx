import { AboutDialogContent } from './AboutDialogContent'
import { Button, Dialog, Skeleton, Typography, Snackbar } from '@mui/material'
import { captureFeedback } from '@sentry/react'
import { CloseButton } from './CloseButton'
import { FC, SyntheticEvent, useState } from 'react'
import { FeedbackForm } from './FeedbackForm'
import {
  gridFilteredTopLevelRowCountSelector,
  GridFooterContainer,
  useGridApiContext,
  useGridSelector
} from '@mui/x-data-grid-pro'
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

  const handleCloseDialog = () => {
    setEmail('')
    setMessage('')
    setName('')
    setIsDialogOpen(false)

    // Prevent <AboutDialogContent> from flickering into view during <Dialog> close transition.
    setTimeout(() => setIsFeedbackMode(false), 225)
  }

  const handleCloseSnackbar = (_?: SyntheticEvent | Event, reason?: string) =>
    reason !== 'clickaway' && setIsSnackbarOpen(false)

  const handleFeedbackMode = () => setIsFeedbackMode(true)

  const handleOpenDialog = () => setIsDialogOpen(true)

  const handleSubmitFeedback = async () => {
    captureFeedback({ email, message, name }, { includeReplay: true })

    setIsSnackbarOpen(true)

    handleCloseDialog()
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

      <Button onClick={handleOpenDialog} size="small">
        About
      </Button>

      <Dialog
        onClose={handleCloseDialog}
        open={isDialogOpen}
        PaperProps={{ sx: { bottom: 10, m: 0, minWidth: { xs: 359 }, position: 'fixed', right: 8 } }}
      >
        {isFeedbackMode ? (
          <FeedbackForm
            email={email}
            message={message}
            name={name}
            onCancel={handleCloseDialog}
            onSubmit={handleSubmitFeedback}
            setEmail={setEmail}
            setMessage={setMessage}
            setName={setName}
          />
        ) : (
          <AboutDialogContent onClose={handleCloseDialog} onFeedbackMode={handleFeedbackMode} />
        )}
      </Dialog>

      <Snackbar
        action={<CloseButton onClose={handleCloseSnackbar} />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        open={isSnackbarOpen}
        message="Thank you for your feedback!"
        sx={{ bottom: '10px !important', right: '8px !important' }}
      />
    </GridFooterContainer>
  )
}
