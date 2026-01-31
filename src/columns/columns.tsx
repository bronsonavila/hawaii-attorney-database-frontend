import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid-pro'
import { Box, Link, Tooltip } from '@mui/material'
import { InfoOutlined } from '@mui/icons-material'
import { MultiValueCell } from '@/components/MultiValueCell'
import { Row } from '@/types/row'
import {
  getMultiValueFilterOperators,
  getValuesForDisplay,
  createMultiValueSortComparator
} from '@/utils/dataGrid/multiValue'

interface GetColumnsOptions {
  isTouchLike: boolean
  licenseTypes: string[]
  membershipSectionOptions: string[]
  otherLicenseOptions: string[]
}

export const getColumns = ({
  isTouchLike,
  licenseTypes,
  membershipSectionOptions,
  otherLicenseOptions
}: GetColumnsOptions): GridColDef<Row>[] => [
  {
    field: 'name',
    headerName: 'Name',
    renderCell: params => (
      <Box sx={{ alignItems: 'center', display: 'flex', gap: 0.5, maxWidth: '100%' }}>
        {params.row.isMissingFromSource ? (
          <Box
            component="span"
            sx={{
              display: 'inline-block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {params.value as string}
          </Box>
        ) : (
          <Link
            color="inherit"
            href={`https://hsba.org/member-directory/${encodeURIComponent(params.row.id)}`}
            onClick={event => event.stopPropagation()}
            rel="noopener noreferrer"
            sx={{
              display: 'inline-block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            target="_blank"
            underline={isTouchLike ? 'always' : 'hover'}
          >
            {params.value as string}
          </Link>
        )}
        {params.row.isMissingFromSource && (
          <Tooltip title="Not found in HSBA directory. Data may be outdated.">
            <InfoOutlined color="action" sx={{ fontSize: 16, opacity: 0.6 }} />
          </Tooltip>
        )}
      </Box>
    ),
    width: 220
  },
  {
    align: 'left',
    field: 'jdNumber',
    headerAlign: 'left',
    headerName: 'JD Number',
    type: 'number',
    valueFormatter: (value: number | null) => (value === null || value === undefined ? '' : value.toString()),
    valueGetter: (value: string) => Number(value),
    width: 150
  },
  {
    field: 'licenseType',
    headerName: 'License Status',
    type: 'singleSelect',
    valueOptions: licenseTypes,
    width: 200
  },
  { field: 'employer', headerName: 'Organization', width: 240 },
  { field: 'location', headerName: 'Location', width: 350 },
  { field: 'emailDomain', headerName: 'Email Domain', width: 175 },
  { field: 'lawSchool', headerName: 'Law School', width: 200 },
  {
    field: 'barAdmissionDate',
    headerName: 'Bar Admission Date',
    type: 'date',
    valueFormatter: (value: Date | null) => (value instanceof Date ? value.toLocaleDateString() : ''),
    valueGetter: (value: string | null) => (value ? new Date(value) : null),
    width: 200
  },
  {
    field: 'membershipSections',
    filterOperators: getMultiValueFilterOperators(),
    headerName: 'Membership Sections',
    renderCell: (params: GridRenderCellParams<Row>) => {
      const filterModel = params.api.state.filter.filterModel
      const displayValues = getValuesForDisplay(params.row.membershipSections, filterModel, 'membershipSections')

      return <MultiValueCell values={displayValues} />
    },
    sortComparator: createMultiValueSortComparator('membershipSections'),
    type: 'singleSelect',
    valueGetter: (_value, row) => row.membershipSections.join('; '),
    valueOptions: membershipSectionOptions,
    width: 280
  },
  {
    field: 'otherLicenses',
    filterOperators: getMultiValueFilterOperators(),
    headerName: 'Also Licensed In',
    renderCell: (params: GridRenderCellParams<Row>) => {
      const filterModel = params.api.state.filter.filterModel
      const displayValues = getValuesForDisplay(params.row.otherLicenses, filterModel, 'otherLicenses')

      return <MultiValueCell values={displayValues} />
    },
    sortComparator: createMultiValueSortComparator('otherLicenses'),
    type: 'singleSelect',
    valueGetter: (_value, row) => row.otherLicenses.join('; '),
    valueOptions: otherLicenseOptions,
    width: 200
  }
]
