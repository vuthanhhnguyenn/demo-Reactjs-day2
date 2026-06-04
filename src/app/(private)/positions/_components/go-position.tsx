import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function GoPositions() {
  return (
    <Button asChild variant="outline">
      <Link href="/positions">Quay lại danh sách</Link>
    </Button>
  );
}
