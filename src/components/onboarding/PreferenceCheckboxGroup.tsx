
import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface PreferenceOption {
  label: string;
  value: string;
}

interface PreferenceCheckboxGroupProps {
  options: PreferenceOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

const PreferenceCheckboxGroup = ({
  options,
  selectedValues,
  onChange,
}: PreferenceCheckboxGroupProps) => {
  const handleCheckboxChange = (value: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedValues, value]);
    } else {
      onChange(selectedValues.filter((v) => v !== value));
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {options.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <Checkbox
            id={option.value}
            checked={selectedValues.includes(option.value)}
            onCheckedChange={(checked) =>
              handleCheckboxChange(option.value, checked as boolean)
            }
          />
          <label
            htmlFor={option.value}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {option.label}
          </label>
        </div>
      ))}
    </div>
  );
};

export default PreferenceCheckboxGroup;
