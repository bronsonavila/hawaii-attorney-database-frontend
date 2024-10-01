import { Box, Typography, Select, MenuItem, SelectChangeEvent } from '@mui/material'
import { FC } from 'react'
import {
  gridFilteredTopLevelRowCountSelector,
  GridFooterContainer,
  GridPagination,
  gridPaginationModelSelector,
  useGridApiContext,
  useGridSelector
} from '@mui/x-data-grid'

export const CustomPagination: FC = () => {
  const apiRef = useGridApiContext()
  const filteredRowCount = useGridSelector(apiRef, gridFilteredTopLevelRowCountSelector)
  const paginationModel = useGridSelector(apiRef, gridPaginationModelSelector)

  const currentPage = paginationModel.page + 1
  const totalPages = Math.ceil(filteredRowCount / paginationModel.pageSize)

  const handlePageChange = (event: SelectChangeEvent<number>) => {
    const newPage = event.target.value as number

    apiRef.current.setPage(newPage - 1)
  }

  return (
    <GridFooterContainer sx={{ gap: 2, justifyContent: 'center', pl: 1 }}>
      <Box sx={{ alignItems: 'center', display: 'flex', flexShrink: 0, gap: 1, width: 'max-content' }}>
        <Typography variant="body2" sx={{ fontSize: { xs: 12, sm: 14 } }}>
          Page
        </Typography>

        <Select
          value={currentPage}
          onChange={handlePageChange}
          size="small"
          sx={{
            fontSize: { xs: 12, sm: 14 },
            width: { xs: 70, sm: 74 },
            '.MuiSelect-select': { fontSize: { xs: 12, sm: 14 } }
          }}
        >
          {Array.from({ length: totalPages }, (_, index) => (
            <MenuItem key={index + 1} value={index + 1} sx={{ fontSize: { xs: 12, sm: 14 } }}>
              {index + 1}
            </MenuItem>
          ))}
        </Select>

        <Typography variant="body2" sx={{ fontSize: { xs: 12, sm: 14 } }}>
          of {totalPages}
        </Typography>
      </Box>

      <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, fontSize: { xs: 12, sm: 14 }, pl: 3 }}>
        Results:
      </Typography>

      <GridPagination
        sx={{
          '& .MuiTablePagination-actions': { button: { p: { xs: 0.25, sm: 0.5 } }, ml: { xs: '10px', sm: '20px' } },
          '& .MuiTablePagination-displayedRows': { fontSize: { xs: 12, sm: 14 } },
          '& .MuiTablePagination-input': { display: 'none' },
          '& .MuiTablePagination-selectLabel': { display: 'none' },
          '& .MuiTablePagination-toolbar': { pl: { xs: 1, sm: 0 } }
        }}
      />
    </GridFooterContainer>
  )
}
