import type {GetCrmPositionsResponse} from "@/lib/api/@tanstack/react-query.gen";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type Position = GetCrmPositionsResponse["positions"][number];

type PositionsTableProps = {
    positions: Position[];
    selectedPositionId: number | null;
    onSelectPosition: (position: Position) => void;
};


export function PositionsTable({positions, selectedPositionId, onSelectPosition,}: PositionsTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tên chức vụ</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Mô tả quyền</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {positions.map((position) => {
                    const description =
                        typeof position.features.description === "string"
                            ? position.features.description
                            : "Không có mô tả";

                    return (
                        <TableRow
                            key={position.id}
                            className={
                                position.id === selectedPositionId ? "bg-muted" :
                                    undefined
                            }
                        >
                            <TableCell>{position.id}</TableCell>
                            <TableCell className="font-medium">
                                {position.position_name}
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary">{position.role}</Badge>
                            </TableCell>
                            <TableCell>{description}</TableCell>
                            <TableCell className="text-right">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onSelectPosition(position)}
                                >
                                    Xem chi tiết
                                </Button>
                            </TableCell>
                        </TableRow>
                    );
                })}

            </TableBody>
        </Table>
    );
}
