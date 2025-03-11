import { ReactNode } from 'react'
import { css } from '../../styled-system/css'

interface ContainerProps {
  children: ReactNode
}

export function Container({ children }: ContainerProps) {
  return (
    <div
      className={css({
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '4',
        width: 'full',
      })}
    >
      {children}
    </div>
  )
} 