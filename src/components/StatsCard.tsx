import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: "primary" | "success" | "warning" | "danger" | "info";
}

export const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = "primary" 
}: StatsCardProps) => {
  const colorClasses = {
    primary: "text-blue-600 bg-blue-50 dark:bg-blue-950/20",
    success: "text-green-600 bg-green-50 dark:bg-green-950/20",
    warning: "text-orange-600 bg-orange-50 dark:bg-orange-950/20",
    danger: "text-red-600 bg-red-50 dark:bg-red-950/20",
    info: "text-purple-600 bg-purple-50 dark:bg-purple-950/20"
  };

  return (
    <Card className="border border-primary/20 hover:border-primary/40 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-semibold text-foreground">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};