import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, TrendingUp, Calendar, UserPlus, Baby, Heart, BarChart3, History, Activity } from "lucide-react";
import { AttendanceForm } from "@/components/AttendanceForm";
import { StatsCard } from "@/components/StatsCard";
import { AttendanceChart } from "@/components/AttendanceChart";
import { MonthlyHistory } from "@/components/MonthlyHistory";
import { FilterDialog } from "@/components/FilterDialog";
import { ExportDialog } from "@/components/ExportDialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import churchIcon from "@/assets/church-icon.png";
import { GrowthStatsCard } from "@/components/GrowthStatsCard";

interface AttendanceData {
  date: Date;
  homens: number;
  homensVisitantes: number;
  mulheres: number;
  mulheresVisitantes: number;
  kids: number;
  baby: number;
}

const Index = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<'day' | 'month' | 'year' | null>(null);
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([
    // Dados de exemplo
    {
      date: new Date(2024, 0, 7), // 07/01/2024
      homens: 25,
      homensVisitantes: 3,
      mulheres: 35,
      mulheresVisitantes: 5,
      kids: 12,
      baby: 4
    },
    {
      date: new Date(2024, 0, 14), // 14/01/2024
      homens: 28,
      homensVisitantes: 2,
      mulheres: 32,
      mulheresVisitantes: 4,
      kids: 15,
      baby: 6
    },
    {
      date: new Date(2024, 0, 21), // 21/01/2024
      homens: 30,
      homensVisitantes: 4,
      mulheres: 38,
      mulheresVisitantes: 6,
      kids: 18,
      baby: 5
    },
    {
      date: new Date(2024, 0, 28), // 28/01/2024
      homens: 26,
      homensVisitantes: 1,
      mulheres: 34,
      mulheresVisitantes: 3,
      kids: 14,
      baby: 7
    }
  ]);

  const handleAddAttendance = (data: AttendanceData) => {
    setAttendanceData(prev => [...prev, data]);
  };

  const handleEditAttendance = (data: AttendanceData) => {
    if (editingIndex !== null) {
      setAttendanceData(prev => 
        prev.map((item, index) => index === editingIndex ? data : item)
      );
      setEditingIndex(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteAttendance = (index: number) => {
    setAttendanceData(prev => prev.filter((_, i) => i !== index));
  };

  const openEditDialog = (index: number) => {
    setEditingIndex(index);
    setIsEditDialogOpen(true);
  };

  // Filtrar dados
  const filteredData = (filterType && filterDate) 
    ? attendanceData.filter(record => {
        const recordDate = record.date;
        const selectedYear = filterDate.getFullYear();
        const selectedMonth = filterDate.getMonth();
        const selectedDay = filterDate.getDate();

        switch (filterType) {
          case 'day':
            return recordDate.getFullYear() === selectedYear &&
                   recordDate.getMonth() === selectedMonth &&
                   recordDate.getDate() === selectedDay;
          case 'month':
            return recordDate.getFullYear() === selectedYear &&
                   recordDate.getMonth() === selectedMonth;
          case 'year':
            return recordDate.getFullYear() === selectedYear;
          default:
            return true;
        }
      })
    : attendanceData;

  // Cálculos para as estatísticas (usando dados filtrados)
  const totalAttendance = filteredData.reduce((sum, record) => 
    sum + record.homens + record.homensVisitantes + record.mulheres + 
    record.mulheresVisitantes + record.kids + record.baby, 0
  );

  const averageAttendance = filteredData.length > 0 
    ? Math.round(totalAttendance / filteredData.length) 
    : 0;

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const totalVisitorsThisMonth = attendanceData.filter(record => {
      const recordDate = record.date;
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
  }).reduce((sum, record) =>
      sum + record.homensVisitantes + record.mulheresVisitantes, 0
  );

  const sortedFilteredData = [...filteredData].sort((a, b) => a.date.getTime() - b.date.getTime());

  const lastAttendance = sortedFilteredData.length > 0 
    ? sortedFilteredData[sortedFilteredData.length - 1] 
    : null;

  const lastTotal = lastAttendance 
    ? lastAttendance.homens + lastAttendance.homensVisitantes + 
      lastAttendance.mulheres + lastAttendance.mulheresVisitantes + 
      lastAttendance.kids + lastAttendance.baby
    : 0;

  const handleApplyFilter = (type: 'day' | 'month' | 'year', date?: Date) => {
    setFilterType(type);
    setFilterDate(date || null);
  };

  const handleClearFilter = () => {
    setFilterType(null);
    setFilterDate(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground flex items-center gap-3">
                Frequência - Igreja Novo Tempo em Células
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Gerencimento e monitoramento de frequência dos cultos
              </p>
            </div>
            <div className="flex items-center gap-3">
              <FilterDialog 
                onApplyFilter={handleApplyFilter}
                onClearFilter={handleClearFilter}
              />
              <ExportDialog data={attendanceData} />
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr" />
                    Nova Frequência
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Registrar Frequência do Culto</DialogTitle>
                </DialogHeader>
                <AttendanceForm 
                  onSubmit={handleAddAttendance}
                  onClose={() => setIsDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>

            {/* Dialog de Edição */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Editar Frequência do Culto</DialogTitle>
                </DialogHeader>
                {editingIndex !== null && (
                  <AttendanceForm 
                    onSubmit={handleEditAttendance}
                    onClose={() => setIsEditDialogOpen(false)}
                    initialData={attendanceData[editingIndex]}
                  />
                )}
              </DialogContent>
            </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-3">
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <GrowthStatsCard data={sortedFilteredData} />
              <StatsCard
                title="Média por Culto"
                value={averageAttendance}
                subtitle="pessoas em média"
                icon={Activity}
                color="info"
              />
              <StatsCard
                title="Visitantes no Mês"
                value={totalVisitorsThisMonth}
                subtitle="visitantes recebidos no mês"
                icon={UserPlus}
                color="warning"
              />
              <StatsCard
                title="Último Culto"
                value={lastTotal}
                subtitle="pessoas presentes"
                icon={Heart}
                color="danger"
              />
            </div>

            {/* Charts */}
            <AttendanceChart data={filteredData} type="line" />
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            {/* Monthly History */}
            <MonthlyHistory 
              data={attendanceData} 
              onEdit={openEditDialog}
              onDelete={handleDeleteAttendance}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;