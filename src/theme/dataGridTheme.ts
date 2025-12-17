export const DATA_GRID_THEME_OVERRIDES = {
  MuiButtonBase: { defaultProps: { disableRipple: true } },
  MuiDataGrid: {
    // Elements rendered in a Popper element cannot be styled via DataGridPro.sx.
    styleOverrides: {
      columnsManagement: { padding: '12px 24px' },
      columnsManagementHeader: { display: 'none' },
      menu: { '.MuiButtonBase-root': { minHeight: 'auto' } },
      panelWrapper: {
        '@media (max-width: 599px)': {
          '&:has(.MuiDataGrid-panelContent)': {
            width: 'clamp(370px, 95vw, 540px)',
            '.MuiButton-icon': { ml: '-2px' },
            '.MuiButtonBase-root': { fontSize: 13, padding: '4px 5px' },
            '.MuiDataGrid-panelFooter .MuiSvgIcon-root': { fontSize: 18 },
            '.MuiFormLabel-root': { transform: 'translate(0, -1.5px) scale(0.67)' },
            '.MuiInputBase-input': { fontSize: 13 },
            '.MuiInputBase-root': { fontSize: 13 },
            '.MuiSvgIcon-root': { fontSize: 16 }
          }
        }
      },
      root: { border: 'none', height: '100dvh', width: '100dvw' }
    }
  },
  MuiInputBase: { defaultProps: { autoComplete: 'off' } },
  MuiList: {
    styleOverrides: { root: { '@media (max-width: 599px)': { '.MuiButtonBase-root': { minHeight: 'auto' } } } }
  }
}
