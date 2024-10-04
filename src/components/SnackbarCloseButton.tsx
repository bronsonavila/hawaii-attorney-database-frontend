import { IconButton } from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { FC } from 'react'

interface SnackbarCloseButtonProps {
  onClose: () => void
}

export const SnackbarCloseButton: FC<SnackbarCloseButtonProps> = ({ onClose }) => (
  <IconButton aria-label="close" color="inherit" onClick={onClose} size="small">
    <CloseIcon fontSize="small" />
  </IconButton>
)
