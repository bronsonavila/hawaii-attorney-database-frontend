import { Box, Typography } from '@mui/material'
import { CustomPagination } from './CustomPagination'
import { FC } from 'react'

export const CustomFooter: FC = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
    <CustomPagination />

    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
      <Typography sx={{ flexShrink: 0, p: 1, fontSize: { xs: 11, sm: 12 }, textAlign: 'center' }} variant="caption">
        Last updated: Sep. 30, 2024
      </Typography>

      <Typography sx={{ flexShrink: 0, p: 1, fontSize: { xs: 11, sm: 12 }, textAlign: 'center' }} variant="caption">
        Source:{' '}
        <Typography
          component="a"
          href="https://hsba.org/HSBA_2020/For_the_Public/Find_a_Lawyer/HSBA_2020/Public/Find_a_Lawyer.aspx"
          rel="noopener noreferrer"
          sx={{
            color: 'inherit',
            textDecoration: 'underline',
            '&:hover': { textDecoration: 'underline' },
            fontSize: { xs: 11, sm: 12 }
          }}
          target="_blank"
          variant="caption"
        >
          HSBA Member Directory
        </Typography>
      </Typography>
    </Box>
  </Box>
)
