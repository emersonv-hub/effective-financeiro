interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  iconOnly?: boolean
  theme?: 'dark' | 'light'
}

const heights: Record<string, number> = { sm: 28, md: 40, lg: 56, xl: 72 }

export function Logo({ size = 'md', iconOnly = false }: LogoProps) {
  const h = heights[size] ?? 40

  if (iconOnly) {
    return (
      <img src="/logo.png" alt="Effective" style={{ height: h }} className="w-auto object-contain" />
    )
  }

  return (
    <img src="/logo.png" alt="Effective" style={{ height: h }} className="w-auto object-contain" />
  )
}

export default Logo
