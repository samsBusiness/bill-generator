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
  allowAdd = false,
}) => {
  const [options, setOptions] = useState(items);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(initValue);
  const [filteredItems, setFilteredItems] = useState(items);
  const [customValue, setCustomValue] = useState(""); // State for custom value

  useEffect(() => {
    onChange(value);
  }, [value]);

  const handleSearch = (query: string) => {
    setFilteredItems(
      options.filter((option: any) =>
        option.label.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  const handleCustomValueChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCustomValue(event.target.value);
  };
  const handleAddCustomValue = () => {
    if (customValue) {
      setValue(customValue);
      setOptions([...options, {label: customValue, value: customValue}]);
      setOpen(false);
    }
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
              options.find((option: any) => option.value === value)?.label
            ) : (
              <p>{placeholderText}</p>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className=" max-h-[--radix-popover-content-available-height] "
        >
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
            {allowAdd && (
              <div className="mt-2">
                <input
                  type="text"
                  value={customValue}
                  onChange={handleCustomValueChange}
                  placeholder="Type your own value"
                  className="border border-gray-300 rounded-md px-3 py-2 w-full"
                  onKeyDown={(event: any) => {
                    if (event.key === "Enter") {
                      handleAddCustomValue();
                      event.preventDefault();
                    }
                  }}
                />
                <Button
                  onClick={handleAddCustomValue}
                  size={"sm"}
                  className="mt-1"
                >
                  Add
                </Button>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
