

import GoPositions from "./(private)/positions/_components/go-position";
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 px-4 text-center dark:bg-black">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-zinc-950 dark:text-zinc-50">
          Positions Demo
        </h1>
        <p className="text-muted-foreground">
          Demo tra cứu, tạo và quản lý chức vụ nhân viên.
        </p>
      </div>

      <GoPositions />
    </main>
  );
}
