import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

type PositionsSummaryProps = {
    totalPositions: number;
    totalRoles: number;
};

export function PositionsSummary({totalPositions, totalRoles,}: PositionsSummaryProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Tổng số chức vụ</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-semibold">{totalPositions}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Tổng số nhóm role </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-semibold">{totalRoles}</p>
                </CardContent>
            </Card>

        </div>
    );
}
