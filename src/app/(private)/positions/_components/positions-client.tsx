"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCrmPosition,
  deleteCrmPosition,
  getCrmPositionsOptions,
  getCrmPositionsSummaryOptions,
  type GetCrmPositionsResponse,
  type GetCrmPositionsSummaryResponse,
  updateCrmPosition,
} from "@/lib/api/@tanstack/react-query.gen";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type Position,
  type UpdatePositionRequest,
} from "@/lib/api/position.schema";
import { CreatePositionDialog } from "./create-position-dialog";
import { EditPositionDialog } from "./edit-position-dialog";
import { PositionDetailDialog } from "./position-detail-dialog";
import { PositionsFilters } from "./positions-filters";
import { PositionsPagination } from "./positions-pagination";
import { PositionsSummary } from "./positions-summary";
import { PositionsTable } from "./positions-table";
import { POSITIONS_PAGE_SIZE } from "../_constants/constants";
import { usePositionsFilters } from "../_hooks/use-positions-filters";
import type { CreatePositionFormValues } from "../_schemas/create-position.schema";

type PositionsClientProps = {
  initialData: GetCrmPositionsResponse;
  initialSummary: GetCrmPositionsSummaryResponse;
};

export function PositionsClient({
  initialData,
  initialSummary,
}: PositionsClientProps) {
  const queryClient = useQueryClient();

  const { filters, setFilters, clearFilters } = usePositionsFilters();
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);

  const { data, isLoading, isError } = useQuery({
    ...getCrmPositionsOptions({
      page: filters.page,
      pageSize: POSITIONS_PAGE_SIZE,
      search: filters.search,
      role: filters.role,
    }),
    initialData,
  });
  const { data: summary } = useQuery({
    ...getCrmPositionsSummaryOptions(),
    initialData: initialSummary,
  });

  const positions = data.positions;
  const pagination = data.pagination ?? {
    page: 1,
    pageSize: POSITIONS_PAGE_SIZE,
    totalItems: positions.length,
    totalPages: 1,
  };
  function updatePositionsCache(
    updater: (currentPositions: Position[]) => Position[],
  ) {
    queryClient.setQueryData<GetCrmPositionsResponse>(
      ["getCrmPositions"],
      (currentData) =>
        currentData
          ? {
              ...currentData,
              positions: updater(currentData.positions),
            }
          : {
              positions: updater(positions),
              pagination,
            },
    );
  }

  const createPositionMutation = useMutation({
    mutationFn: createCrmPosition,
    onSuccess: (createdPosition) => {
      updatePositionsCache((currentPositions) => [
        ...currentPositions,
        createdPosition,
      ]);

      void queryClient.invalidateQueries({
        queryKey: ["getCrmPositions"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["getCrmPositionsSummary"],
      });
    },
  });

  const updatePositionMutation = useMutation({
    mutationFn: updateCrmPosition,
    onSuccess: (updatedPosition) => {
      updatePositionsCache((currentPositions) =>
        currentPositions.map((position) =>
          position.id === updatedPosition.id ? updatedPosition : position,
        ),
      );

      void queryClient.invalidateQueries({
        queryKey: ["getCrmPositions"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["getCrmPositionsSummary"],
      });
    },
  });

  const deletePositionMutation = useMutation({
    mutationFn: deleteCrmPosition,
    onSuccess: (_data, deletedPositionId) => {
      updatePositionsCache((currentPositions) =>
        currentPositions.filter((position) => position.id !== deletedPositionId),
      );

      void queryClient.invalidateQueries({
        queryKey: ["getCrmPositions"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["getCrmPositionsSummary"],
      });

      if (filters.id === deletedPositionId) {
        void setFilters({ id: null });
      }
    },
  });

  const selectedPosition = useMemo(() => {
    return positions.find((position) => position.id === filters.id);
  }, [positions, filters.id]);

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
        totalPositions={summary.totalPositions}
        totalRoles={summary.totalRoles}
      />

      <PositionsFilters
        search={filters.search}
        role={filters.role}
        onSearchChange={(search) => void setFilters({ page: 1, search })}
        onRoleChange={(role) => void setFilters({ page: 1, role })}
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
      ) : positions.length === 0 ? (
        <p className="text-muted-foreground">Không tìm thấy chức vụ phù hợp.</p>
      ) : (
        <div className="space-y-4">
          <PositionsTable
            positions={positions}
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

          <PositionsPagination
            page={pagination.page}
            pageSize={pagination.pageSize}
            totalItems={pagination.totalItems}
            totalPages={pagination.totalPages}
            onPageChange={(page) => void setFilters({ page })}
          />
        </div>
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
