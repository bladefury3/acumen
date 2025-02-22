
import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

interface MultiComboboxProps {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  emptyMessage?: string;
}

export function MultiCombobox({
  options = [], // Default to empty array
  selected = [], // Default to empty array
  onChange,
  placeholder = "Select options...",
  emptyMessage = "No results found.",
}: MultiComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [commandValue, setCommandValue] = React.useState("");

  // Ensure options and selected are always arrays
  const safeOptions = React.useMemo(() => {
    return Array.isArray(options) ? options : [];
  }, [options]);

  const safeSelected = React.useMemo(() => {
    return Array.isArray(selected) ? selected : [];
  }, [selected]);

  const selectedItems = React.useMemo(() => 
    safeOptions.filter((option) => safeSelected.includes(option.value)),
    [safeOptions, safeSelected]
  );

  const handleSelect = React.useCallback((value: string) => {
    const isSelected = safeSelected.includes(value);
    if (isSelected) {
      onChange(safeSelected.filter((v) => v !== value));
    } else {
      onChange([...safeSelected, value]);
    }
  }, [onChange, safeSelected]);

  const handleRemove = React.useCallback((value: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    onChange(safeSelected.filter((v) => v !== value));
  }, [onChange, safeSelected]);

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
          className="w-full justify-between bg-background min-h-[2.5rem] h-auto"
        >
          <div className="flex flex-wrap gap-1 pr-6">
            {selectedItems.length === 0 && placeholder}
            {selectedItems.map((item) => (
              <Badge
                key={item.value}
                variant="secondary"
                className="mr-1 mb-1"
              >
                {item.label}
                <button
                  type="button"
                  className="ml-1 ring-offset-background rounded-full outline-none hover:bg-secondary"
                  onClick={(e) => handleRemove(item.value, e)}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove</span>
                </button>
              </Badge>
            ))}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 absolute right-3" />
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
                onSelect={() => handleSelect(option.value)}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    safeSelected.includes(option.value) ? "opacity-100" : "opacity-0"
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
