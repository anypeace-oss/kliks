
import { cn } from '@/lib/utils';
import Image from 'next/image';

export const Logo = ({ className }: { className?: string; }) => {
    return (
        <div className="flex items-center gap-4">
            <Image src={"/logo-mono.svg"} width={40} height={40} alt='kreeasi Logo' className={cn('dark:invert', className)} /> <span className='font-mono  font-bold '>Kreeasi</span>
        </div>
    )
}

export const LogoIcon = ({ className }: { className?: string; }) => {
    return (
        <Image src={"/logo-mono.svg"} width={40} height={40} alt='Kreeasi Logo Icon' className={cn('dark:invert', className)} />
    )
}

