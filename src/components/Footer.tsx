import { Button, Dialog, DialogActions, DialogContent, Divider, Link, Skeleton, Stack, Typography } from '@mui/material'
import { FC, ReactNode, useState } from 'react'
import {
  gridFilteredTopLevelRowCountSelector,
  GridFooterContainer,
  useGridApiContext,
  useGridSelector
} from '@mui/x-data-grid-pro'
import { useLoadingContext } from '../contexts/useLoadingContext'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

const ExternalLink: FC<{ children: ReactNode; href: string }> = ({ children, href }) => (
  <Link href={href} rel="noopener noreferrer" sx={{ alignItems: 'center', display: 'inline-flex' }} target="_blank">
    {children}
    <OpenInNewIcon sx={{ fontSize: 'inherit', ml: 0.5 }} />
  </Link>
)

export const Footer: FC = () => {
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
                <ExternalLink href="https://hsba.org/HSBA_2020/For_the_Public/Find_a_Lawyer/HSBA_2020/Public/Find_a_Lawyer.aspx">
                  HSBA Member Directory
                </ExternalLink>
              </Typography>

              <Typography variant="body2">
                License types:{' '}
                <ExternalLink href="https://hsba.org/images/HSBA/MembershipStatus.pdf">
                  HSBA Membership Status
                </ExternalLink>
              </Typography>
            </Stack>

            <Divider sx={{ my: 2.5 }} />

            <Stack spacing={1.5}>
              <Typography variant="body2">Independently maintained by: Bronson Avila</Typography>

              <Typography variant="body2">Last updated: Sep. 30, 2024</Typography>
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
