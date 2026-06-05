import { notFound } from "next/navigation";
import { getAllPositionsForPage } from "@/lib/api/positions.server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
type PositionDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function PositionDetailPage({
  params,
}: PositionDetailPageProps) {
  const { id } = await params;
  const positionId = Number(id);
  if (Number.isNaN(positionId)) {
    notFound();
  }

  const positions = await getAllPositionsForPage();
  const position = positions.find((item) => item.id === positionId);

  if (!position) {
    notFound();
  }
  return (
    <section className="space-y-6">
      <Button asChild variant="outline">
        <Link href="/positions">Quay lại danh sách</Link>
      </Button>
      <div>
        <h1 className="break-words text-2xl font-semibold">
          {position.position_name}
        </h1>
        <p className="text-muted-foreground">
          Chi tiết chức vụ ID {position.id}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin chức vụ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-muted-foreground text-sm">Role</p>
            <Badge variant="secondary">{position.role}</Badge>
          </div>

          <div>
            <p className="text-muted-foreground text-sm">Tên chức vụ</p>
            <p className="break-words font-medium">{position.position_name}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Danh sách quyền</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(position.features).map(([key, value]) => (
            <div
              key={key}
              className="grid grid-cols-[120px_minmax(0,1fr)] gap-4 rounded-md border p-3"
            >
              <span className="break-words font-medium">{key}</span>
              <span className="text-muted-foreground min-w-0 break-words text-right">
                {typeof value === "boolean"
                  ? value
                    ? "Có"
                    : "Không"
                  : String(value)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
