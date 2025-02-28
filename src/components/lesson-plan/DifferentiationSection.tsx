
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain } from "lucide-react";

const DifferentiationSection = () => {
  return (
    <Card className="border shadow-sm h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-[#003C5A]" />
          <CardTitle className="text-base sm:text-lg font-semibold">Differentiation Strategies</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium text-sm text-[#003C5A] mb-2">Support Strategies</h4>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-[#003C5A] text-lg">•</span>
              <span className="text-sm text-gray-700">Pre-made circle templates</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#003C5A] text-lg">•</span>
              <span className="text-sm text-gray-700">Step-by-step guides</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#003C5A] text-lg">•</span>
              <span className="text-sm text-gray-700">Visual reference sheets</span>
            </li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium text-sm text-[#003C5A] mb-2">Extension Activities</h4>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-[#003C5A] text-lg">•</span>
              <span className="text-sm text-gray-700">Advanced problem sets</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#003C5A] text-lg">•</span>
              <span className="text-sm text-gray-700">Real-world applications</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#003C5A] text-lg">•</span>
              <span className="text-sm text-gray-700">Independent projects</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default DifferentiationSection;
