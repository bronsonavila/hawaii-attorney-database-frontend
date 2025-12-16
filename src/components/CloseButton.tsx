import { Close as CloseIcon } from '@mui/icons-material'
import { IconButton } from '@mui/material'

interface CloseButtonProps {
  onClose: () => void
}

export const CloseButton = ({ onClose }: CloseButtonProps) => (
  <IconButton aria-label="close" color="inherit" onClick={onClose} size="small">
    <CloseIcon fontSize="small" />
  </IconButton>
)
