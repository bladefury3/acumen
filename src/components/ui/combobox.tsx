
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

interface ComboboxProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
}

export function Combobox({
  options = [], // Default to empty array
  value = "", // Default to empty string
  onChange,
  placeholder = "Select option...",
  emptyMessage = "No results found.",
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [commandValue, setCommandValue] = React.useState("");

  // Ensure options is always an array
  const safeOptions = React.useMemo(() => {
    return Array.isArray(options) ? options : [];
  }, [options]);

  const handleSelect = React.useCallback(
    (currentValue: string) => {
      onChange(currentValue === value ? "" : currentValue);
      setOpen(false);
    },
    [onChange, value]
  );

  return (
    <Popover 
      open={open} 
      onOpenChange={setOpen}
      modal={true}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-background"
        >
          <span className="line-clamp-1">
            {value
              ? safeOptions.find((option) => option.value === value)?.label
              : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-full min-w-[var(--radix-popover-trigger-width)] p-0 bg-background"
        align="start"
        sideOffset={5}
      >
        <Command value={commandValue} onValueChange={setCommandValue}>
          <CommandInput placeholder={`Search...`} />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup>
            {safeOptions.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={handleSelect}
                className="cursor-pointer"
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
        </Command>
      </PopoverContent>
    </Popover>
  );
}

