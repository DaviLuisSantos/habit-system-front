import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function LoadingCard() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-20 w-full" />
      </CardContent>
    </Card>
  );
}

export function LoadingScoreWidget() {
  return (
    <Card className="bg-linear-to-br from-blue-500/10 to-blue-500/5">
      <CardContent className="p-6">
        <Skeleton className="h-8 w-24 mx-auto mb-2" />
        <Skeleton className="h-16 w-32 mx-auto mb-2" />
        <Skeleton className="h-4 w-48 mx-auto" />
      </CardContent>
    </Card>
  );
}

export function LoadingHabitCard() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="grid grid-cols-3 gap-2 sm:flex">
            <Skeleton className="h-10 w-full rounded-full sm:w-10" />
            <Skeleton className="h-10 w-full rounded-full sm:w-10" />
            <Skeleton className="h-10 w-full rounded-full sm:w-10" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function LoadingHabitsList() {
  return (
    <div className="space-y-4">
      <LoadingHabitCard />
      <LoadingHabitCard />
      <LoadingHabitCard />
    </div>
  );
}

export function LoadingChart() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2 h-48">
          <Skeleton className="h-24 flex-1" />
          <Skeleton className="h-32 flex-1" />
          <Skeleton className="h-40 flex-1" />
          <Skeleton className="h-28 flex-1" />
          <Skeleton className="h-36 flex-1" />
          <Skeleton className="h-20 flex-1" />
          <Skeleton className="h-44 flex-1" />
        </div>
      </CardContent>
    </Card>
  );
}

export function LoadingPage() {
  return (
    <div className="space-y-6 p-4">
      <LoadingScoreWidget />
      <LoadingHabitsList />
      <LoadingChart />
    </div>
  );
}
