import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { validateOptions } from "@/utils/dataValidation";

interface ComboboxProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
}

export function Combobox({
  options = [],  // <--- Default value to ensure options is always an array
  value = "",   // <--- Default value to ensure value is always a string
  onChange,
  placeholder = "Select option...",
  emptyMessage = "No results found.",
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  // Validate options before rendering
  const validatedOptions = Array.isArray(options)
    ? validateOptions(options)
    : [];

  console.log("Validated Options:", validatedOptions);
  console.log("Combobox Value:", value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-background"
        >
          <span className="line-clamp-1">
            {value
              ? validatedOptions.find((option) => option.value === value)
                  ?.label
              : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[var(--radix-popover-trigger-width)] p-0 bg-background">
        <Command>
          <CommandInput placeholder={`Search...`} />
          {validatedOptions.length > 0 ? (
            <CommandGroup className="max-h-[300px] overflow-auto">
              {validatedOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : (
            <CommandEmpty>{emptyMessage}</CommandEmpty>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}