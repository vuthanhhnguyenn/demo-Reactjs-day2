import type { GetCrmPositionsResponse } from "@/lib/api/@tanstack/react-query.gen";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  onEditPosition: (position: Position) => void;
  onDeletePosition: (position: Position) => void;
  deletingPositionId: number | null;
};

export function PositionsTable({
  positions,
  selectedPositionId,
  onSelectPosition,
  onEditPosition,
  onDeletePosition,
  deletingPositionId,
}: PositionsTableProps) {
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
                position.id === selectedPositionId ? "bg-muted" : undefined
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
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectPosition(position)}
                  >
                    Xem chi tiết
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => onEditPosition(position)}
                  >
                    Sửa
                  </Button>
                  <Button asChild type="button" variant="ghost" size="sm">
                    <Link href={`/positions/${position.id}`} prefetch={false}>
                      Trang chi tiết
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={deletingPositionId === position.id}
                    onClick={() => onDeletePosition(position)}
                  >
                    {deletingPositionId === position.id ? "Đang xóa..." : "Xóa"}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
