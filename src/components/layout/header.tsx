
import Link from "next/link";
import { Button } from "../ui/button";

export default function Header() {
  return (
    <header className=" flex  items-center justify-between mx-auto border-b px-4   md:px-50 py-3 fixed top-0 left-0 right-0 z-50 bg-background">
      <Link href={"/"} className="text-2xl text-foreground/90 font-mono font-bold text-shadow-2xs">
        KLIKS
      </Link>
      <nav className="flex gap-4 items-center">
        <Button variant={"outline"} size={"sm"} asChild>
          <Link  href={"/login"}>Log in</Link>
        </Button>
        <Button variant={"default"} size={"sm"} asChild>
          <Link href={"/login"}>Sign up</Link>
        </Button>
      </nav>
    </header>
  );
}
