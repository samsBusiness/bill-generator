import React, {useEffect, useState} from "react";
import {Check, ChevronsUpDown} from "lucide-react";

import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {CommandList} from "cmdk";

export const Combobox: React.FC<any> = ({
  items,
  onChange,
  placeholderText,
  className,
  initValue,
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(initValue);
  const [filteredItems, setFilteredItems] = useState(items);

  useEffect(() => {
    onChange(value);
  }, [value]);

  const handleSearch = (query: string) => {
    setFilteredItems(
      items.filter((item: any) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      )
    );
  };
  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value ? (
              items.find((item: any) => item.value === value)?.label
            ) : (
              <p>{placeholderText}</p>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height]">
          <Command>
            <CommandInput
              placeholder="Search Items..."
              onValueChange={handleSearch}
            />
            <CommandEmpty>No item found.</CommandEmpty>
            <CommandGroup>
              <CommandList>
                {filteredItems.map((item: any) => (
                  <CommandItem
                    key={item.value}
                    value={item.value}
                    defaultValue={initValue}
                    onSelect={(currentValue) => {
                      setValue(currentValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === item.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {item.label}
                  </CommandItem>
                ))}
              </CommandList>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
