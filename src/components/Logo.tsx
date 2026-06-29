// src/components/Logo.tsx
// Logo oficial Effective — baseado na identidade visual da marca

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Mostra somente o símbolo, sem o texto */
  iconOnly?: boolean
  /** Cor do fundo onde o logo vai ser exibido — 'dark' (padrão) ou 'light' */
  theme?: 'dark' | 'light'
}

export function Logo({ size = 'md', iconOnly = false, theme = 'dark' }: LogoProps) {
  const heights = { sm: 32, md: 48, lg: 72, xl: 96 }
  const h = heights[size]

  // Cores adaptadas ao tema de fundo
  const letterColor  = theme === 'dark' ? '#4d4d3d' : '#3a3a2e'
  const outerStroke  = theme === 'dark' ? '#4d4d3d' : '#3a3a2e'
  const ringFill     = '#8caabf'
  const holeFill     = theme === 'dark' ? '#18180f' : '#f5f5f0'

  // Proporcional ao original: viewBox ~680×200 → escalar pelo h
  const w = Math.round(h * 3.6)

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 680 200"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Effective"
    >
      <title>Effective</title>

      {/* "effe" */}
      {!iconOnly && (
        <text
          x="10" y="162"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontStyle="italic"
          fontWeight="400"
          fontSize="152"
          fill={letterColor}
          letterSpacing="-4"
        >
          effe
        </text>
      )}

      {/* Símbolo: duplo anel excêntrico (os dois "c" centrais) */}
      {/* Anel externo escuro */}
      <ellipse
        cx={iconOnly ? 340 : 388}
        cy="100"
        rx="74" ry="86"
        fill="none"
        stroke={outerStroke}
        strokeWidth="18"
      />
      {/* Anel interno azul-acinzentado */}
      <ellipse
        cx={iconOnly ? 340 : 388}
        cy="100"
        rx="54" ry="63"
        fill={ringFill}
      />
      {/* Furo central — recuado para simular a abertura do "C" */}
      <ellipse
        cx={iconOnly ? 352 : 400}
        cy="100"
        rx="34" ry="44"
        fill={holeFill}
      />

      {/* "tive" */}
      {!iconOnly && (
        <text
          x="448" y="162"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontStyle="italic"
          fontWeight="400"
          fontSize="152"
          fill={letterColor}
          letterSpacing="-4"
        >
          tive
        </text>
      )}
    </svg>
  )
}

export default Logo
