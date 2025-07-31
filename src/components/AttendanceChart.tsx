import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

interface AttendanceData {
  date: Date;
  homens: number;
  homensVisitantes: number;
  mulheres: number;
  mulheresVisitantes: number;
  kids: number;
  baby: number;
}

interface AttendanceChartProps {
  data: AttendanceData[];
  type?: "bar" | "line";
}

export const AttendanceChart = ({ data, type = "bar" }: AttendanceChartProps) => {
  const chartData = data.map(item => ({
    data: item.date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    }),
    total: item.homens + item.homensVisitantes + item.mulheres + item.mulheresVisitantes + item.kids + item.baby,
    membros: item.homens + item.mulheres,
    visitantes: item.homensVisitantes + item.mulheresVisitantes,
    criancas: item.kids + item.baby
  })).slice(-8); // Últimas 8 entradas

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`Data: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey === 'total' ? 'Total' : 
                entry.dataKey === 'membros' ? 'Membros' :
                entry.dataKey === 'visitantes' ? 'Visitantes' : 'Crianças'}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gradient-card shadow-card border-0">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Frequência por Culto
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {type === "bar" ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="data" 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="total" 
                  fill="hsl(var(--church-primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="data" 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="hsl(var(--church-primary))" 
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--church-primary))", strokeWidth: 2 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};