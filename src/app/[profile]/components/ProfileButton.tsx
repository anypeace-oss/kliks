import { Button, buttonVariants } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { type VariantProps } from "class-variance-authority";

interface ProfileButtonProps extends VariantProps<typeof buttonVariants> {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function ProfileButton({ 
  variant = "default", 
  size = "default",
  href, 
  children, 
  className 
}: ProfileButtonProps) {
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full justify-between"
      >
        <span className="font-medium">{children}</span>
        <ArrowUpRight className="w-4 h-4" />
      </a>
    </Button>
  );
}