// Logo inspirado na identidade visual da Effective Fisioterapia
export function Logo({ size = 'md', collapsed = false }: { size?: 'sm' | 'md' | 'lg'; collapsed?: boolean }) {
  const sizes = { sm: 28, md: 36, lg: 48 };
  const px = sizes[size];

  return (
    <div className="flex items-center gap-2 select-none">
      {/* Ícone circular duplo — inspirado no logo Effective */}
      <svg width={px} height={px} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="22" stroke="#3d3d2e" strokeWidth="4" fill="none" />
        <path d="M 32 14 A 12 12 0 0 1 32 34" stroke="#728a9f" strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M 16 24 L 32 24" stroke="#2250fc" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 16 19 L 28 19" stroke="#2250fc" strokeWidth="2" strokeLinecap="round" />
        <path d="M 16 29 L 28 29" stroke="#2250fc" strokeWidth="2" strokeLinecap="round" />
      </svg>

      {!collapsed && (
        <div className="flex flex-col leading-none">
          <span className="font-bold text-white tracking-tight" style={{ fontSize: size === 'sm' ? 14 : size === 'md' ? 16 : 20 }}>
            effective
          </span>
          <span className="text-[#728a9f] font-medium tracking-widest uppercase" style={{ fontSize: size === 'sm' ? 8 : 9 }}>
            FisioManager
          </span>
        </div>
      )}
    </div>
  );
}
