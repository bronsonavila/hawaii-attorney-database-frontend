import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { App } from '../../src/App'
import { LoadingProvider } from '../../src/contexts/LoadingContext'
import { loadTestRows } from '../utils/testUtils'
import { vi } from 'vitest'
import React from 'react'

vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material')

  return { ...actual, useMediaQuery: vi.fn().mockReturnValue(false) } // Default to light mode.
})

global.fetch = vi.fn(url => {
  if (url === '/processed-member-records.csv') {
    // Mock a successful response with an empty body.
    const response = new Response('', { headers: new Headers(), status: 200, statusText: 'OK' })

    return Promise.resolve(response)
  }

  return Promise.reject(new Error('Invalid URL'))
})

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    localStorage.clear()
  })

  it('loads more than 10,000 rows from CSV', () => {
    const rows = loadTestRows()

    expect(rows.length).toBeGreaterThan(10000)
  })

  it('renders without crashing', async () => {
    await act(async () => {
      render(
        <LoadingProvider>
          <App />
        </LoadingProvider>
      )
    })

    expect(screen.getByText('Hawaii Attorney Database')).toBeInTheDocument()
  })

  it('handles theme switching', async () => {
    await act(async () => {
      render(
        <LoadingProvider>
          <App />
        </LoadingProvider>
      )
    })

    const themeSwitch = screen.getByRole('checkbox', { name: /Switch to dark mode/i })

    expect(themeSwitch).toBeInTheDocument()
    expect(localStorage.getItem('theme')).toBe('light')

    await act(async () => fireEvent.click(themeSwitch))

    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('renders DataGridPro with correct columns', async () => {
    await act(async () => {
      render(
        <LoadingProvider>
          <App />
        </LoadingProvider>
      )
    })

    await waitFor(() => {
      expect(screen.getByText('JD Number')).toBeInTheDocument()
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('License Type')).toBeInTheDocument()
      expect(screen.getByText('Employer')).toBeInTheDocument()
      expect(screen.getByText('Location')).toBeInTheDocument()
      expect(screen.getByText('Email Domain')).toBeInTheDocument()
      expect(screen.getByText('Law School')).toBeInTheDocument()
      expect(screen.getByText('Bar Admission Date')).toBeInTheDocument()
    })
  })
})
