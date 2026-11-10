import Link from "next/link";
import { IconLeaf } from "@/components/icons";

interface BrandProps {
  href?: string;
  ecoColor?: string;
  eatsColor?: string;
}

export function Brand({
  href = "/",
  ecoColor = "text-current",
  eatsColor = "text-(--color-primary)",
}: BrandProps) {
  return (
    <Link href={href} className="eco-brand" aria-label="EcoEats Home">
      <span className="eco-brand-mark" aria-hidden="true">
        <IconLeaf size={18} className="text-white" />
      </span>
      <span>
        <span className={ecoColor}>Eco</span>
        <span className={eatsColor}>Eats</span>
      </span>
    </Link>
  );
}
