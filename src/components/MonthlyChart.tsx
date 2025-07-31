import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface AttendanceData {
  date: Date;
  homens: number;
  homensVisitantes: number;
  mulheres: number;
  mulheresVisitantes: number;
  kids: number;
  baby: number;
}

interface MonthlyChartProps {
  data: AttendanceData[];
}

export const MonthlyChart = ({ data }: MonthlyChartProps) => {
  // Agrupar dados por mês
  const monthlyData = data.reduce((acc, item) => {
    const monthKey = item.date.toLocaleDateString('pt-BR', { 
      year: 'numeric', 
      month: 'long' 
    });
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        mes: monthKey,
        total: 0,
        cultos: 0,
        homens: 0,
        mulheres: 0,
        visitantes: 0,
        criancas: 0
      };
    }
    
    const total = item.homens + item.homensVisitantes + item.mulheres + item.mulheresVisitantes + item.kids + item.baby;
    acc[monthKey].total += total;
    acc[monthKey].cultos += 1;
    acc[monthKey].homens += item.homens + item.homensVisitantes;
    acc[monthKey].mulheres += item.mulheres + item.mulheresVisitantes;
    acc[monthKey].visitantes += item.homensVisitantes + item.mulheresVisitantes;
    acc[monthKey].criancas += item.kids + item.baby;
    
    return acc;
  }, {} as Record<string, any>);

  const chartData = Object.values(monthlyData).map((month: any) => ({
    ...month,
    media: Math.round(month.total / month.cultos)
  }));

  // Dados para o gráfico de pizza (distribuição geral)
  const totalHomens = data.reduce((sum, item) => sum + item.homens + item.homensVisitantes, 0);
  const totalMulheres = data.reduce((sum, item) => sum + item.mulheres + item.mulheresVisitantes, 0);
  const totalCriancas = data.reduce((sum, item) => sum + item.kids + item.baby, 0);

  const pieData = [
    { name: 'Homens', value: totalHomens, color: '#3B82F6' },
    { name: 'Mulheres', value: totalMulheres, color: '#EC4899' },
    { name: 'Crianças', value: totalCriancas, color: '#F97316' }
  ];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-gradient-card shadow-card border-0">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Frequência Mensal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="mes" 
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    value,
                    name === 'total' ? 'Total do Mês' : 'Média por Culto'
                  ]}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <Bar 
                  dataKey="total" 
                  fill="hsl(var(--church-primary))" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="media" 
                  fill="hsl(var(--church-success))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card shadow-card border-0">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Distribuição por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any, name: string) => [value, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium">{entry.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};