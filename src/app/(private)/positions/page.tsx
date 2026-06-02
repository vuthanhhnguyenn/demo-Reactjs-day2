"use client";

import {Suspense, useMemo} from "react";
import {useQuery} from "@tanstack/react-query";

import {getCrmPositionsOptions, type GetCrmPositionsResponse,} from "@/lib/api/@tanstack/react-query.gen";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Skeleton} from "@/components/ui/skeleton";

import {PositionDetailDialog} from "./_components/position-detail-dialog";
import {PositionsFilters} from "./_components/positions-filters";
import {PositionsSummary} from "./_components/positions-summary";
import {PositionsTable} from "./_components/positions-table";
import {usePositionsFilters} from "./_hooks/use-positions-filters";

type Position = GetCrmPositionsResponse["positions"][number];

function PositionsPageContent() {
    const {filters, setFilters, clearFilters} =
        usePositionsFilters();

    const {data, isLoading, isError} = useQuery({
        ...getCrmPositionsOptions(),
    });

    const positions = useMemo(() => data?.positions ?? [], [data?.positions]);

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
        void setFilters({id: position.id});
    }

    function handleCloseDialog() {
        void setFilters({id: null});
    }

    return (
        <section className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Tra cứu chức vụ
                    nhân viên</h1>
                <p className="text-muted-foreground">
                    Tìm kiếm chức vụ và xem chi tiết quyền hạn.
                </p>
            </div>

            <PositionsSummary
                totalPositions={positions.length}
                totalRoles={totalRoles}
            />

            <PositionsFilters
                search={filters.search}
                role={filters.role}
                onSearchChange={(search) => void setFilters({search})}
                onRoleChange={(role) => void setFilters({role})}
                onClear={clearFilters}
            />

            {isLoading ? (
                <div className="space-y-3">
                    <Skeleton className="h-10 w-full"/>
                    <Skeleton className="h-10 w-full"/>
                    <Skeleton className="h-10 w-full"/>
                </div>
            ) : isError ? (
                <Alert variant="destructive">
                    <AlertTitle>Không thể tải dữ liệu</AlertTitle>
                    <AlertDescription>
                        Vui lòng thử tải lại trang.
                    </AlertDescription>
                </Alert>
            ) : filteredPositions.length === 0 ? (
                <p className="text-muted-foreground">
                    Không tìm thấy chức vụ phù hợp.
                </p>
            ) : (
                <PositionsTable
                    positions={filteredPositions}
                    selectedPositionId={filters.id}
                    onSelectPosition={handleSelectPosition}
                />
            )}


            <PositionDetailDialog
                position={selectedPosition}
                onClose={handleCloseDialog}
            />
        </section>
    );
}

export default function PositionsPage() {
    return (
        <Suspense fallback={<Skeleton className="h-10 w-full"/>}>
            <PositionsPageContent/>
        </Suspense>
    );
}
