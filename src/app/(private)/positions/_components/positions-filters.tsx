import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    POSITION_ROLES,
    type PositionRole,
} from "../_constants/constants";

type PositionsFiltersProps = {
    search: string;
    role: PositionRole | null;
    onSearchChange: (value: string) => void;
    onRoleChange: (value: PositionRole | null) => void;
    onClear: () => void;
};

export function PositionsFilters({search, role, onSearchChange, onRoleChange, onClear,}: PositionsFiltersProps) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row">
            <Input value={search}
                onChange={(event)=> onSearchChange(event.target.value)}
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
