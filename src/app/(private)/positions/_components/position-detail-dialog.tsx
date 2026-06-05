import type { GetCrmPositionsResponse } from "@/lib/api/@tanstack/react-query.gen";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Position = GetCrmPositionsResponse["positions"][number];

type PositionDetailDialogProps = {
  position: Position | undefined;
  onClose: () => void;
};

function formatFeatureValue(value: unknown) {
  if (typeof value === "boolean") {
    return value ? "Có" : "Không";
  }

  return String(value);
}

export function PositionDetailDialog({
  position,
  onClose,
}: PositionDetailDialogProps) {
  const description =
    position && typeof position.features.description === "string"
      ? position.features.description
      : "Không có mô tả";
  const permissionEntries = position
    ? Object.entries(position.features).filter(([key]) => key !== "description")
    : [];

  return (
    <Dialog
      open={position !== undefined}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-x-hidden overflow-y-auto p-0 sm:max-w-xl">
        {position && (
          <>
            <div className="space-y-5 p-5">
              <DialogHeader className="gap-3 pr-8">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{position.role}</Badge>
                  <span className="text-muted-foreground text-xs">
                    ID chức vụ: {position.id}
                  </span>
                </div>
                <DialogTitle className="break-all text-lg leading-6">
                  {position.position_name}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Chi tiết chức vụ {position.position_name}
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Mô tả quyền
                </p>
                <p className="mt-2 break-all whitespace-pre-wrap leading-6">
                  {description}
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium">Danh sách quyền</h3>

                {permissionEntries.length === 0 ? (
                  <p className="text-muted-foreground rounded-lg border border-dashed p-4 text-sm">
                    Không có quyền chi tiết.
                  </p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {permissionEntries.map(([key, value]) => (
                      <div
                        key={key}
                        className="min-w-0 rounded-md border p-3"
                      >
                        <p className="break-all font-medium">{key}</p>
                        <p className="text-muted-foreground mt-1 break-all text-sm">
                          {formatFeatureValue(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
