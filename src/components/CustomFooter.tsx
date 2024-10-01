import { Box, Typography, Dialog, DialogContent, DialogActions, Link, Button, Stack } from '@mui/material'
import { CustomPagination } from './CustomPagination'
import { FC, useState } from 'react'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

export const CustomFooter: FC = () => {
  const [open, setOpen] = useState(false)

  const handleClickOpen = () => setOpen(true)

  const handleClose = () => setOpen(false)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <CustomPagination />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
        <Typography sx={{ flexShrink: 0, p: 1, fontSize: { xs: 11, sm: 12 }, textAlign: 'center' }} variant="caption">
          Last updated: Sep. 30, 2024
        </Typography>

        <Button onClick={handleClickOpen} size="small" sx={{ borderBottomLeftRadius: 0, borderTopRightRadius: 0 }}>
          About
        </Button>

        <Dialog open={open} onClose={handleClose} PaperProps={{ sx: { bottom: 8, m: 0, position: 'fixed', right: 8 } }}>
          <DialogContent>
            <Stack spacing={1.5}>
              <Typography variant="body2">
                Data source:{' '}
                <Link
                  href="https://hsba.org/HSBA_2020/For_the_Public/Find_a_Lawyer/HSBA_2020/Public/Find_a_Lawyer.aspx"
                  rel="noopener noreferrer"
                  sx={{ alignItems: 'center', display: 'inline-flex' }}
                  target="_blank"
                >
                  HSBA Member Directory
                  <OpenInNewIcon sx={{ fontSize: 'inherit', ml: 0.5 }} />
                </Link>
              </Typography>

              <Typography variant="body2">Created and maintained by Bronson Avila.</Typography>
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose} size="small">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  )
}
