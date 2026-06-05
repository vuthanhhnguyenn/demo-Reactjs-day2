import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { POSITION_ROLES, type PositionRole } from "../_constants/constants";

type PositionsFiltersProps = {
  search: string;
  role: PositionRole | null;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: PositionRole | null) => void;
  onClear: () => void;
};

const SEARCH_DEBOUNCE_MS = 600;

export function PositionsFilters({
  search,
  role,
  onSearchChange,
  onRoleChange,
  onClear,
}: PositionsFiltersProps) {
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    if (localSearch === search) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      onSearchChange(localSearch.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [localSearch, onSearchChange, search]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Input
        value={localSearch}
        onChange={(event) => setLocalSearch(event.target.value)}
        placeholder="Tìm kiếm theo chức vụ"
      />

      <Select
        value={role ?? "all"}
        onValueChange={(value) =>
          onRoleChange(value === "all" ? null : (value as PositionRole))
        }
      >
        <SelectTrigger className="w-full sm:w-56">
          <SelectValue placeholder="Chọn role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả role</SelectItem>

          {POSITION_ROLES.map((positionRole) => (
            <SelectItem key={positionRole} value={positionRole}>
              {positionRole}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button type="button" variant="outline" onClick={onClear}>
        Xóa bộ lọc
      </Button>
    </div>
  );
}
