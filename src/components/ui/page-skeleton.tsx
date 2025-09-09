import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const PageSkeleton = ({ 
  title = "Loading...", 
  showHeader = true,
  showActions = false 
}: { 
  title?: string;
  showHeader?: boolean;
  showActions?: boolean;
}) => {
  return (
    <div className="p-4 md:p-6 space-y-6">
      {showHeader && (
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-80" />
          </div>
          {showActions && (
            <div className="flex flex-col sm:flex-row gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-28" />
            </div>
          )}
        </div>
      )}

      {/* Content Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex justify-between">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const SettingsSkeleton = () => {
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Tabs */}
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-24" />
          ))}
        </div>

        {/* Tab Content */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-80" />
          </CardHeader>
          <CardContent className="space-y-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <div className="flex justify-end">
              <Skeleton className="h-10 w-24" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};