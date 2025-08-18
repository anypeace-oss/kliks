import { IconClick } from '@tabler/icons-react';
import { cn } from '../lib/utils'

export const Logo = ({ className }: { className?: string; }) => {
    return (
        <div className="flex items-center gap-4">
            <IconClick className={cn('text-foreground ', className)} /> <span className='font-mono font-medium'>KLIKS</span>
        </div>
    )
}

export const LogoIcon = ({ className }: { className?: string; }) => {
    return (
        <IconClick className={cn('text-foreground', className)} />
    )
}

