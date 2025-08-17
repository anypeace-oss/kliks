
import Link from "next/link";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ArrowUpRight } from "lucide-react";

export const HeroSection = () => {
    return (
        <div className="pt-30 flex items-start text-left md:text-center md:items-center justify-center flex-col gap-6 pb-10 ">
            <Link
                href="/"
                className="flex items-center rounded-full border overflow-hidden hover:bg-muted transition"
            >
                {/* Kiri: Judul */}
                <span className="px-2 py-1.5 text-xs font-medium">
                    How create affiliates with Kliks
                </span>

                {/* Kanan: Read more */}
                <span className="border-l flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    Read more
                    <ArrowUpRight size={12} />
                </span>
            </Link>
            <h1 className="text-5xl font-medium">
                {/* Mulai hasilkan <br />cuan secara online! */}
                Lynk.id Alternative
            </h1>
            <p className="text-md text-foreground max-w-xl">
                Cukup buat halaman profilmu, langsung bisa jualan produk digital dan
                membangun brand di media sosial—tanpa ribet, Sat Set.
            </p>

            <div className="flex items-center gap-2">

                {/* <div className="flex items-center w-full rounded-lg border shadow-sm overflow-hidden pl-5 pr-5">
                    <span className="text-sm  flex-shrink-0">kliks.id/</span>
                    <Input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="yourprofilename"
                        className="flex-1 bg-background shadow-none text-sm border-0 p-0 focus-visible:ring-0 focus-visible:outline-none"
                    />
                </div> */}

                <div className="flex items-center w-full rounded-lg border shadow-sm overflow-hidden pl-5 pr-5">
                    <Input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="yourprofilename"
                        className="flex-1 bg-background shadow-none text-sm border-0 p-0 focus-visible:ring-0 focus-visible:outline-none"
                    />
                </div>

                {/* Tombol */}
                <Button variant="default" className="rounded-lg px-6 py-1 text-sm">
                    <Link href="/login">Join Waitlist</Link>
                </Button>
            </div>
        </div>
    );
};
