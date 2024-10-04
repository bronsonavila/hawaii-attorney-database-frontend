import { IconButton } from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { FC } from 'react'

interface CloseButtonProps {
  onClose: () => void
}

export const CloseButton: FC<CloseButtonProps> = ({ onClose }) => (
  <IconButton aria-label="close" color="inherit" onClick={onClose} size="small">
    <CloseIcon fontSize="small" />
  </IconButton>
)
