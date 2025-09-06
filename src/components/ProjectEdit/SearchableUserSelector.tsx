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
import { User } from "@/types";

interface SearchableUserSelectorProps {
  users: User[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  emptyText: string;
  disabled?: boolean;
}

export function SearchableUserSelector({
  users,
  value,
  onValueChange,
  placeholder,
  emptyText,
  disabled = false,
}: SearchableUserSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const selectedUser = users.find((user) => user.id === value);

  const handleSelect = (userId: string) => {
    onValueChange(userId === value ? "" : userId);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-10"
          disabled={disabled}
        >
          {selectedUser ? (
            <div className="flex items-center gap-2 flex-1">
              <span className="truncate">
                {selectedUser.first_name} {selectedUser.last_name}
              </span>
              <Badge variant="secondary" className="text-xs">
                {selectedUser.role}
              </Badge>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <div className="flex items-center gap-1">
            {selectedUser && !disabled && (
              <X
                className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
                onClick={handleClear}
              />
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <Command>
          <CommandInput placeholder={`Search ${emptyText.toLowerCase()}...`} />
          <CommandEmpty>No users found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {users.map((user) => (
              <CommandItem
                key={user.id}
                value={`${user.first_name} ${user.last_name} ${user.email} ${user.role}`}
                onSelect={() => handleSelect(user.id)}
                className="flex items-center gap-2"
              >
                <Check
                  className={cn(
                    "h-4 w-4",
                    value === user.id ? "opacity-100" : "opacity-0"
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
        </Command>
      </PopoverContent>
    </Popover>
  );
}