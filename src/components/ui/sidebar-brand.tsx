import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { TypographyH4 } from "@/components/ui/typography";

type SidebarBrandProps = {
  logoSrc?: string;
  companyName: string;
  href?: string;
};

export const SidebarBrand: React.FC<SidebarBrandProps> = ({
  logoSrc,
  companyName,
  href = "/",
}) => {
  return (
    <Link href={href}>
      <Card className="flex items-center gap-4 p-4 hover:bg-accent transition-colors rounded-lg cursor-pointer">
        <Avatar className="h-10 w-10">
          <AvatarImage src={logoSrc} alt={`${companyName} Logo`} />
          <AvatarFallback>{companyName[0]}</AvatarFallback>
        </Avatar>
        <CardContent className="p-0">
          <TypographyH4 className="text-primary">{companyName}</TypographyH4>
        </CardContent>
      </Card>
    </Link>
  );
};