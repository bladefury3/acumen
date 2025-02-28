
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AIAssistantSection = () => {
  return (
    <Card className="border shadow-sm h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 p-2 rounded-md">
            <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
              <line x1="6" y1="6" x2="6.01" y2="6"></line>
              <line x1="6" y1="18" x2="6.01" y2="18"></line>
            </svg>
          </div>
          <CardTitle className="text-base sm:text-lg font-semibold">AI Teaching Assistant</CardTitle>
        </div>
        <p className="text-sm text-gray-500 mt-1">Generate custom resources for your lesson</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button variant="outline" className="w-full justify-start text-sm h-auto py-3">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <span>Generate Worksheet</span>
          </div>
        </Button>
        
        <Button variant="outline" className="w-full justify-start text-sm h-auto py-3">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <span>Create Visual Aids</span>
          </div>
        </Button>
        
        <Button variant="outline" className="w-full justify-start text-sm h-auto py-3">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            <span>Create Assessment</span>
          </div>
        </Button>
      </CardContent>
    </Card>
  );
};

export default AIAssistantSection;
