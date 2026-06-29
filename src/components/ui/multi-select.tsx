import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface Option { label: string; value: string }

interface Props {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export function MultiSelect({ options, value, onChange, placeholder = 'Selecione...' }: Props) {
  const [open, setOpen] = useState(false);

  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter(v => v !== id) : [...value, id]);
  };

  const selected = options.filter(o => value.includes(o.value));

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          variant="outline"
          type="button"
          className="w-full justify-between font-normal h-auto min-h-9 flex-wrap gap-1 px-3 py-1.5"
        >
          {selected.length === 0 ? (
            <span className="text-muted-foreground text-sm">{placeholder}</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {selected.map(o => (
                <span
                  key={o.value}
                  className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                >
                  {o.label}
                  <X
                    size={10}
                    className="cursor-pointer hover:text-destructive"
                    onClick={e => { e.stopPropagation(); toggle(o.value); }}
                  />
                </span>
              ))}
            </div>
          )}
          <ChevronsUpDown size={14} className="shrink-0 text-muted-foreground ml-auto" />
        </Button>
      </Popover.Trigger>
      <Popover.Content
        className="w-[var(--radix-popover-trigger-width)] p-1 bg-popover border rounded-md shadow-md z-50 max-h-56 overflow-y-auto"
        sideOffset={4}
      >
        {options.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">Nenhuma opção.</p>
        )}
        {options.map(o => (
          <button
            key={o.value}
            type="button"
            onClick={() => toggle(o.value)}
            className={cn(
              'flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded hover:bg-accent hover:text-accent-foreground text-left',
              value.includes(o.value) && 'font-medium'
            )}
          >
            <div
              className={cn(
                'w-4 h-4 rounded border flex items-center justify-center shrink-0',
                value.includes(o.value) ? 'bg-primary border-primary' : 'border-input'
              )}
            >
              {value.includes(o.value) && <Check size={10} className="text-primary-foreground" />}
            </div>
            {o.label}
          </button>
        ))}
      </Popover.Content>
    </Popover.Root>
  );
}
