"use client";

import {Suspense, useMemo, useState} from "react";
import {useQuery} from "@tanstack/react-query";

import {getCrmPositionsOptions, type GetCrmPositionsResponse,} from "@/lib/api/@tanstack/react-query.gen";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Skeleton} from "@/components/ui/skeleton";

import {PositionDetailDialog} from "./_components/position-detail-dialog";
import {PositionsFilters} from "./_components/positions-filters";
import {PositionsSummary} from "./_components/positions-summary";
import {PositionsTable} from "./_components/positions-table";
import {usePositionsFilters} from "./_hooks/use-positions-filters";
import {CreatePositionDialog} from "./_components/create-position-dialog";
import type { CreatePositionFormValues } from "./_schemas/create-position.schema";

type Position = GetCrmPositionsResponse["positions"][number];



function PositionsPageContent() {
    const {filters, setFilters, clearFilters} =
        usePositionsFilters();

    const {data, isLoading, isError} = useQuery({
        ...getCrmPositionsOptions(),
    });
    const [createdPositions, setCreatedPositions] = useState<Position[]>([]);
    const positions = useMemo(
        () => [...(data?.positions ?? []), ...createdPositions],
        [data?.positions, createdPositions],
    );
  
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
    function handleCreatePosition(values: CreatePositionFormValues) {
        const nextId =
        positions.length === 0
        ? 1
        : Math.max(...positions.map((position) => position.id)) + 1;

        const newPosition: Position = {
            id: nextId,
            role: values.role,
            position_name: values.position_name,
            features: {
            description: values.description,
            ...Object.fromEntries(
            values.permissions.map((permission) => [permission, true]),),
            },
        };

        setCreatedPositions((current) => [...current, newPosition]);
    }
    return (
        <section className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Tra cứu chức vụ nhân viên</h1>
                <p className="text-muted-foreground">
                    Tìm kiếm chức vụ và xem chi tiết quyền hạn.
                </p>
            </div>

            <CreatePositionDialog onCreatePosition = {handleCreatePosition} />

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
