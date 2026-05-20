import { AttorneyAgeMap } from '@/components/maps/AttorneyAgeMap'
import { SLIDESHOW_ACTIVE_ATTORNEY_AGE_AS_OF_DATE } from '@/constants/chartConstants'
import { Box, createTheme, CssBaseline, ThemeProvider, Typography } from '@mui/material'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const theme = createTheme({ palette: { mode: 'light' } })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100dvh',
          overflow: 'hidden',
          p: 2,
          boxSizing: 'border-box'
        }}
      >
        <Box sx={{ flexShrink: 0, pb: 1 }}>
          <Typography component="h1" sx={{ fontSize: 20, fontWeight: 600, lineHeight: 1.25 }} variant="h2">
            HSBA Active Attorneys - Age Map
          </Typography>

          <Typography sx={{ color: 'text.secondary', fontSize: 16 }} variant="body2">
            As of {SLIDESHOW_ACTIVE_ATTORNEY_AGE_AS_OF_DATE}
          </Typography>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0 }}>
          <AttorneyAgeMap />
        </Box>
      </Box>
    </ThemeProvider>
  </StrictMode>
)
