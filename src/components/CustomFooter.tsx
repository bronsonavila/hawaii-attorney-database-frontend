import { Button, Dialog, DialogActions, DialogContent, Link, Skeleton, Stack, Typography } from '@mui/material'
import { FC, useState } from 'react'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import {
  gridFilteredTopLevelRowCountSelector,
  GridFooterContainer,
  useGridApiContext,
  useGridSelector
} from '@mui/x-data-grid-pro'
import { useLoadingContext } from '../contexts/useLoadingContext'

export const CustomFooter: FC = () => {
  const [open, setOpen] = useState(false)
  const { isLoading } = useLoadingContext()
  const apiRef = useGridApiContext()
  const totalRowCount = useGridSelector(apiRef, gridFilteredTopLevelRowCountSelector)

  const handleClickOpen = () => setOpen(true)

  const handleClose = () => setOpen(false)

  return (
    <GridFooterContainer
      sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', pl: 1.25, pr: 1, py: 1 }}
    >
      {isLoading ? (
        <Skeleton sx={{ height: 24, ml: 0.25, width: 125 }} />
      ) : (
        <Typography variant="body2">Total Rows: {totalRowCount}</Typography>
      )}

      <>
        <Button onClick={handleClickOpen} size="small">
          About
        </Button>

        <Dialog
          open={open}
          onClose={handleClose}
          PaperProps={{ sx: { bottom: 10, m: 0, position: 'fixed', right: 8 } }}
        >
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

              <Typography variant="body2">Last updated: Sep. 30, 2024</Typography>

              <Typography variant="body2">Created and maintained by Bronson Avila.</Typography>
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose} size="small">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </>
    </GridFooterContainer>
  )
}
