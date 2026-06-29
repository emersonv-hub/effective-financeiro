export function Logo({ collapsed = false }: { size?: 'sm' | 'md' | 'lg'; collapsed?: boolean }) {
  if (collapsed) {
    return (
      <div className="flex items-center justify-center select-none">
        <img src="/logo.png" alt="Effective" className="h-7 w-auto object-contain" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start select-none gap-0.5">
      <img src="/logo.png" alt="Effective" className="h-8 w-auto object-contain" />
      <span className="text-[#728a9f] font-medium tracking-widest uppercase text-[9px] pl-0.5">
        FisioManager
      </span>
    </div>
  );
}
