import { Box, Chip, Tooltip, Typography } from '@mui/material'
import { FC } from 'react'

interface MultiValueCellProps {
  values: string[]
  emptyText?: string
  maxVisible?: number
}

export const MultiValueCell: FC<MultiValueCellProps> = ({ values, emptyText = '', maxVisible = 1 }) => {
  if (values.length === 0) {
    return emptyText ? (
      <Box sx={{ alignItems: 'center', display: 'flex', height: '100%' }}>
        <Typography color="text.secondary" sx={{ fontSize: 12 }} variant="body2">
          {emptyText}
        </Typography>
      </Box>
    ) : null
  }

  const visibleValues = values.slice(0, maxVisible)
  const remainingCount = values.length - visibleValues.length

  const tooltipTitle = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, py: 0.25 }}>
      {values.map(value => (
        <Typography key={value} sx={{ fontSize: 12, lineHeight: 1.25 }} variant="body2">
          {value}
        </Typography>
      ))}
    </Box>
  )

  const content = (
    <Box sx={{ alignItems: 'center', display: 'flex', height: '100%' }}>
      <Box sx={{ alignItems: 'center', display: 'flex', gap: 0.5, overflow: 'hidden' }}>
        {visibleValues.map(value => (
          <Chip
            key={value}
            label={value}
            size="small"
            sx={{
              height: 20,
              maxWidth: 260,
              '.MuiChip-label': { lineHeight: '18px', overflow: 'hidden', px: 0.75, textOverflow: 'ellipsis' }
            }}
            variant="outlined"
          />
        ))}

        {remainingCount > 0 ? (
          <Chip
            label={`+${remainingCount}`}
            size="small"
            sx={{ height: 20, '.MuiChip-label': { lineHeight: '18px', px: 0.75 } }}
            variant="outlined"
          />
        ) : null}
      </Box>
    </Box>
  )

  return values.length >= 2 ? (
    <Tooltip enterDelay={350} enterTouchDelay={0} leaveTouchDelay={2000} placement="top-start" title={tooltipTitle}>
      {content}
    </Tooltip>
  ) : (
    content
  )
}
