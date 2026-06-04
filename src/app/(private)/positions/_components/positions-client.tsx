"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCrmPosition,
  deleteCrmPosition,
  getCrmPositionsOptions,
  type GetCrmPositionsResponse,
  updateCrmPosition,
} from "@/lib/api/@tanstack/react-query.gen";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import type { Position, UpdatePositionRequest } from "@/lib/api/position.schema";
import { CreatePositionDialog } from "./create-position-dialog";
import { EditPositionDialog } from "./edit-position-dialog";
import { PositionDetailDialog } from "./position-detail-dialog";
import { PositionsFilters } from "./positions-filters";
import { PositionsSummary } from "./positions-summary";
import { PositionsTable } from "./positions-table";
import { usePositionsFilters } from "../_hooks/use-positions-filters";
import type { CreatePositionFormValues } from "../_schemas/create-position.schema";

type PositionsClientProps = {
  initialPositions: Position[];
};

export function PositionsClient({ initialPositions }: PositionsClientProps) {
  const queryClient = useQueryClient();

  const { filters, setFilters, clearFilters } = usePositionsFilters();
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);

  const { data, isLoading, isError } = useQuery({
    ...getCrmPositionsOptions(),
    initialData: {
      positions: initialPositions,
    } satisfies GetCrmPositionsResponse,
  });

  const positions = useMemo(() => data?.positions ?? [], [data?.positions]);

  const createPositionMutation = useMutation({
    mutationFn: createCrmPosition,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["getCrmPositions"],
      });
    },
  });

  const updatePositionMutation = useMutation({
    mutationFn: updateCrmPosition,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["getCrmPositions"],
      });
    },
  });

  const deletePositionMutation = useMutation({
    mutationFn: deleteCrmPosition,
    onSuccess: (_data, deletedPositionId) => {
      void queryClient.invalidateQueries({
        queryKey: ["getCrmPositions"],
      });

      if (filters.id === deletedPositionId) {
        void setFilters({ id: null });
      }
    },
  });

  const filteredPositions = useMemo(() => {
    return positions.filter((position) => {
      const search = filters.search.trim().toLowerCase();
      const matchesSearch = position.position_name
        .toLowerCase()
        .includes(search);
      const matchesRole =
        filters.role === null || position.role === filters.role;

      return matchesSearch && matchesRole;
    });
  }, [positions, filters.search, filters.role]);

  const selectedPosition = useMemo(() => {
    return positions.find((position) => position.id === filters.id);
  }, [positions, filters.id]);

  const totalRoles = useMemo(() => {
    return new Set(positions.map((position) => position.role)).size;
  }, [positions]);

  function handleSelectPosition(position: Position) {
    void setFilters({ id: position.id });
  }

  function handleCloseDialog() {
    void setFilters({ id: null });
  }

  function handleCreatePosition(values: CreatePositionFormValues) {
    createPositionMutation.mutate(values);
  }

  function handleEditPosition(position: Position) {
    setEditingPosition(position);
  }

  async function handleUpdatePosition(values: UpdatePositionRequest) {
    await updatePositionMutation.mutateAsync(values);
  }

  function handleDeletePosition(position: Position) {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa chức vụ "${position.position_name}" không?`,
    );

    if (!confirmed) {
      return;
    }

    deletePositionMutation.mutate(position.id);
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tra cứu chức vụ nhân viên</h1>
          <p className="text-muted-foreground">
            Tìm kiếm chức vụ và xem chi tiết quyền hạn.
          </p>
        </div>

        <CreatePositionDialog
          onCreatePosition={handleCreatePosition}
          isCreating={createPositionMutation.isPending}
        />
      </div>
      {createPositionMutation.isError && (
        <Alert variant="destructive">
          <AlertTitle>Tạo chức vụ thất bại</AlertTitle>
          <AlertDescription>
            Vui lòng kiểm tra dữ liệu và thử lại.
          </AlertDescription>
        </Alert>
      )}
      {updatePositionMutation.isError && (
        <Alert variant="destructive">
          <AlertTitle>Sửa chức vụ thất bại</AlertTitle>
          <AlertDescription>
            Vui lòng kiểm tra dữ liệu và thử lại.
          </AlertDescription>
        </Alert>
      )}
      {deletePositionMutation.isError && (
        <Alert variant="destructive">
          <AlertTitle>Xóa chức vụ thất bại</AlertTitle>
          <AlertDescription>
            Vui lòng kiểm tra dữ liệu và thử lại.
          </AlertDescription>
        </Alert>
      )}
      <PositionsSummary
        totalPositions={positions.length}
        totalRoles={totalRoles}
      />

      <PositionsFilters
        search={filters.search}
        role={filters.role}
        onSearchChange={(search) => void setFilters({ search })}
        onRoleChange={(role) => void setFilters({ role })}
        onClear={clearFilters}
      />

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : isError ? (
        <Alert variant="destructive">
          <AlertTitle>Không thể tải dữ liệu</AlertTitle>
          <AlertDescription>Vui lòng thử tải lại trang.</AlertDescription>
        </Alert>
      ) : filteredPositions.length === 0 ? (
        <p className="text-muted-foreground">Không tìm thấy chức vụ phù hợp.</p>
      ) : (
        <PositionsTable
          positions={filteredPositions}
          selectedPositionId={filters.id}
          onSelectPosition={handleSelectPosition}
          onEditPosition={handleEditPosition}
          onDeletePosition={handleDeletePosition}
          deletingPositionId={
            deletePositionMutation.isPending
              ? deletePositionMutation.variables
              : null
          }
        />
      )}

      <EditPositionDialog
        position={editingPosition}
        open={editingPosition !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingPosition(null);
          }
        }}
        onUpdatePosition={handleUpdatePosition}
        isUpdating={updatePositionMutation.isPending}
      />

      <PositionDetailDialog
        position={selectedPosition}
        onClose={handleCloseDialog}
      />
    </section>
  );
}
