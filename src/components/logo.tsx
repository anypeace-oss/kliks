
import Image from 'next/image';

export const Logo = () => {
    return (
        <div className="flex items-center gap-4">
            <Image src={"/logo-mono.svg"} width={40} height={40} alt='logo' className='dark:invert' /> <span className='font-mono font-medium'>Kreeasi</span>
        </div>
    )
}

export const LogoIcon = () => {
    return (
        <Image src={"/logo-mono.svg"} width={40} height={40} alt='logo' className='dark:invert' />
    )
}

