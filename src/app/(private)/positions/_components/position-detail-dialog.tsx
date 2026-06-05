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

export function PositionDetailDialog({
  position,
  onClose,
}: PositionDetailDialogProps) {
  return (
    <Dialog
      open={position !== undefined}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-x-hidden overflow-y-auto sm:max-w-lg">
        {position && (
          <>
            <DialogHeader>
              <DialogTitle className="break-words pr-8">
                {position.position_name}
              </DialogTitle>
              <DialogDescription>ID chức vụ: {position.id}</DialogDescription>
            </DialogHeader>

            <Badge variant="secondary">{position.role}</Badge>

            <div className="space-y-3">
              <h3 className="font-medium">Danh sách quyền</h3>

              <div className="space-y-2">
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
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
