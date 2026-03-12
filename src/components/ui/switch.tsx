import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

const Switch = ({ className, ...props }: SwitchPrimitives.SwitchProps) => (
  <SwitchPrimitives.Root
    className={cn(
      'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-slate-300 transition-colors data-[state=checked]:bg-brand-600',
      className,
    )}
    {...props}
  >
    <SwitchPrimitives.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-5" />
  </SwitchPrimitives.Root>
);

export { Switch };
