import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { CardContent } from "@/components/ui/card";
type SidebarBrandProps = {
  logoSrc?: string;
  companyName: string;
  subtitle?: string;
  href?: string;
};
export const SidebarBrand: React.FC<SidebarBrandProps> = ({
  logoSrc,
  companyName,
  subtitle = "Teacher Account",
  href = "/"
}) => {
  return <Link href={href}>
      <a className="flex items-center gap-3 p-4 hover:bg-accent transition-colors rounded-lg cursor-pointer px-[4px] py-[4px]">
        <Avatar className="h-10 w-10 bg-muted rounded-md">
          <AvatarImage src={logoSrc} alt={`${companyName} Logo`} />
          <AvatarFallback>
            <span className="text-xl font-bold">{companyName[0]}</span>
          </AvatarFallback>
        </Avatar>
        <CardContent className="p-0">
          <h2 className="text-base font-semibold text-primary">
            {companyName}
          </h2>
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        </CardContent>
      </a>
    </Link>;
};