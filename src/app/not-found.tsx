import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NotFound() {
    return (
        <div className='flex flex-col items-center justify-center min-h-screen text-center gap-4'>
            <h2 className='text-2xl  border-b pr-3'>404 </h2>
            <p>This page could not be found.</p>
            <Button >
                <Link href="/">Return Home</Link>
            </Button>
        </div>
    )
}