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
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types";

interface MultiSelectUserSelectorProps {
  users?: User[];
  values: string[];
  onValuesChange: (values: string[]) => void;
  placeholder: string;
  emptyText: string;
  disabled?: boolean;
}

export function MultiSelectUserSelector({
  users,
  values,
  onValuesChange,
  placeholder,
  emptyText,
  disabled = false,
}: MultiSelectUserSelectorProps) {
  const [open, setOpen] = React.useState(false);
  
  // Safety check: ensure users is always an array
  const safeUsers = users || [];
  const selectedUsers = safeUsers.filter(user => values.includes(user.id));

  const handleSelect = (userId: string) => {
    const newValues = values.includes(userId)
      ? values.filter(id => id !== userId)
      : [...values, userId];
    onValuesChange(newValues);
  };

  const handleRemove = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onValuesChange(values.filter(id => id !== userId));
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValuesChange([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between min-h-10 h-auto"
          disabled={disabled}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedUsers.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <>
                {selectedUsers.slice(0, 2).map((user) => (
                  <Badge
                    key={user.id}
                    variant="secondary"
                    className="text-xs flex items-center gap-1"
                  >
                    <span className="truncate max-w-[120px]">
                      {user.first_name} {user.last_name}
                    </span>
                    {!disabled && (
                      <X
                        className="h-3 w-3 cursor-pointer hover:bg-destructive hover:text-destructive-foreground rounded-full"
                        onClick={(e) => handleRemove(user.id, e)}
                      />
                    )}
                  </Badge>
                ))}
                {selectedUsers.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{selectedUsers.length - 2} more
                  </Badge>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-1 ml-2">
            {selectedUsers.length > 0 && !disabled && (
              <X
                className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
                onClick={handleClearAll}
              />
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-background border shadow-md z-50">
        <Command>
          <CommandInput placeholder={`Search ${emptyText.toLowerCase()}...`} />
          <CommandEmpty>No users found.</CommandEmpty>
          <CommandList>
            <CommandGroup className="max-h-64 overflow-auto">
              {safeUsers.map((user) => (
                <CommandItem
                  key={user.id}
                  value={`${user.first_name} ${user.last_name} ${user.email} ${user.role}`}
                  onSelect={() => handleSelect(user.id)}
                  className="flex items-center gap-2"
                >
                  <Check
                    className={cn(
                      "h-4 w-4",
                      values.includes(user.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col flex-1">
                    <span className="font-medium">
                      {user.first_name} {user.last_name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {user.role}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}