import { Link } from '@mui/material'
import { ReactNode } from 'react'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

interface ExternalLinkProps {
  children: ReactNode
  href: string
}

export const ExternalLink = ({ children, href }: ExternalLinkProps) => (
  <Link href={href} rel="noopener noreferrer" sx={{ alignItems: 'center', display: 'inline-flex' }} target="_blank">
    {children}

    <OpenInNewIcon sx={{ fontSize: 'inherit', ml: 0.5 }} />
  </Link>
)
