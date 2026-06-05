import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function GoPositions() {
  return (
    <Button asChild variant="outline">
      <Link href="/positions">Đi tới danh sách</Link>
    </Button>
  );
}
