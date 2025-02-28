
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

interface Resource {
  id: string;
  title: string;
  type: string;
  date: string;
  icon: JSX.Element;
}

const ResourcesSection = () => {
  const [resources] = useState<Resource[]>([
    {
      id: "1",
      title: "Circle Practice Worksheet",
      type: "PDF",
      date: "Generated on Sep 10",
      icon: (
        <svg className="w-8 h-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
      )
    },
    {
      id: "2",
      title: "Visual Aid Slides",
      type: "PPT",
      date: "Generated on Sep 12",
      icon: (
        <svg className="w-8 h-8 text-orange-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
      )
    }
  ]);

  return (
    <Card className="h-full border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-[#003C5A]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
            </svg>
            <CardTitle className="text-base sm:text-lg font-semibold">Available Resources</CardTitle>
          </div>
          <Button variant="ghost" size="icon" className="text-[#003C5A]">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {resources.map((resource) => (
          <div key={resource.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <div className="flex items-center gap-3">
              {resource.icon}
              <div>
                <h4 className="text-sm font-medium text-gray-900">{resource.title}</h4>
                <p className="text-xs text-gray-500">{resource.type} · {resource.date}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-[#003C5A]">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ResourcesSection;
