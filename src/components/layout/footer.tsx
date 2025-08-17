
import ThemeSwitch from "./theme-switch";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";
import { Languages } from "lucide-react";
import Link from "next/link";

export function Footer() {
  const menu = [
    "Changelog",
    "Privacy",
    "Terms",
    "Github",
  ]
  return (
    <footer >
      {/* Use 'flex-col' for small screens and 'md:flex-row' for medium screens and up */}
      <div className=" relative text-sm   mx-auto flex flex-col md:flex-row justify-between items-center gap-6 px-10 py-5 border-t">

        {/* Center the text and links on small screens using 'text-center' */}
        <div className=" tracking-wider w-full md:w-fit text-center">
          &copy; 2025 Made by {" "}
          <Link href="/" className="hover:text-blue-400 transition-all duration-300">
            Anypeace
          </Link>{" "}
        </div>
        <div className="absolute left-0 right-0 top-0 bottom-0 flex items-center justify-center w-fit mx-auto">
          {/* This part remains the same, but the parent div is now centered */}
          {menu.map((item, index) => (
            <span key={index} className="mx-2">
              <Link href={`/${item.toLowerCase()}`} className="hover:text-blue-400 transition-all duration-300">
                {item}
              </Link>
            </span>
          ))}
        </div>



        {/* Center the ThemeSwitch on small screens */}
        <div className="w-full md:w-fit flex justify-center gap-4 items-center">
          <ThemeSwitch />
          <Select>
            <SelectTrigger showChevron={false} size="sm">
              <Languages className="size-4" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="id">Bahasa Indonesia</SelectItem>
            </SelectContent>
          </Select>

        </div>
      </div>
    </footer >
  );
}