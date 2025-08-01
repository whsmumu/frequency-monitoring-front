import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

interface AttendanceData {
  date: Date;
  homens: number;
  homensVisitantes: number;
  mulheres: number;
  mulheresVisitantes: number;
  kids: number;
  baby: number;
}

interface GrowthStatsCardProps {
  data: AttendanceData[];
}

export const GrowthStatsCard = ({ data }: GrowthStatsCardProps) => {
  if (data.length < 2) {
    return (
        <Card className="border border-primary/20">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Crescimento Geral</p>
                        <p className="text-2xl font-semibold text-foreground">N/A</p>
                        <p className="text-xs text-muted-foreground">Dados insuficientes</p>
                    </div>
                    <div className="p-2 rounded-lg text-gray-600 bg-gray-50 dark:bg-gray-950/20">
                        <TrendingUp className="h-5 w-5" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
  }

  const lastData = data[data.length - 1];
  const previousData = data[data.length - 2];

  const lastTotal = lastData.homens + lastData.homensVisitantes + lastData.mulheres + lastData.mulheresVisitantes + lastData.kids + lastData.baby;
  const previousTotal = previousData.homens + previousData.homensVisitantes + previousData.mulheres + previousData.mulheresVisitantes + previousData.kids + previousData.baby;

  const growth = previousTotal > 0 ? ((lastTotal - previousTotal) / previousTotal) * 100 : lastTotal > 0 ? 100 : 0;

  const Icon = growth > 0 ? TrendingUp : growth < 0 ? TrendingDown : ArrowRight;
  const colorClass = growth > 0 ? "text-green-600 bg-green-50 dark:bg-green-950/20" : growth < 0 ? "text-red-600 bg-red-50 dark:bg-red-950/20" : "text-gray-600 bg-gray-50 dark:bg-gray-950/20";


  return (
    <Card className="border border-primary/20 hover:border-primary/40 transition-colors">
        <CardContent className="p-4">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Percentual de membros</p>
                    <p className="text-2xl font-semibold text-foreground">{`${Math.abs(growth).toFixed(1)}%`}</p>
                    <p className="text-xs text-muted-foreground">comparação ao último culto</p>
                </div>
                <div className={`p-2 rounded-lg ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </CardContent>
    </Card>
  );
};