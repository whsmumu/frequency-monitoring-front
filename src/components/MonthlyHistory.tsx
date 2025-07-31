import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Edit, Trash2, Users, UserPlus, Baby } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface AttendanceData {
  date: Date;
  homens: number;
  homensVisitantes: number;
  mulheres: number;
  mulheresVisitantes: number;
  kids: number;
  baby: number;
}

interface MonthlyHistoryProps {
  data: AttendanceData[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

interface MonthGroup {
  monthYear: string;
  records: { data: AttendanceData; originalIndex: number }[];
  total: number;
  average: number;
}

export const MonthlyHistory = ({ data, onEdit, onDelete }: MonthlyHistoryProps) => {
  const [expandedRecord, setExpandedRecord] = useState<number | null>(null);

  // Agrupar dados por mês
  const groupedData = data.reduce((acc: { [key: string]: MonthGroup }, record, index) => {
    const monthYear = format(record.date, "yyyy-MM", { locale: ptBR });
    const monthYearDisplay = format(record.date, "MMMM yyyy", { locale: ptBR });

    if (!acc[monthYear]) {
      acc[monthYear] = {
        monthYear: monthYearDisplay,
        records: [],
        total: 0,
        average: 0
      };
    }

    const total = record.homens + record.homensVisitantes + record.mulheres +
      record.mulheresVisitantes + record.kids + record.baby;

    acc[monthYear].records.push({ data: record, originalIndex: index });
    acc[monthYear].total += total;

    return acc;
  }, {});

  // Calcular médias e ordenar
  const sortedMonths = Object.entries(groupedData)
    .map(([key, group]) => {
      group.average = Math.round(group.total / group.records.length);
      // Ordenar registros por data (mais recente primeiro)
      group.records.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
      return { key, ...group };
    })
    .sort((a, b) => b.key.localeCompare(a.key)); // Ordem decrescente por mês

  const toggleRecordDetails = (index: number) => {
    setExpandedRecord(expandedRecord === index ? null : index);
  };

  const getTotal = (record: AttendanceData) => {
    return record.homens + record.homensVisitantes + record.mulheres +
      record.mulheresVisitantes + record.kids + record.baby;
  };

  if (sortedMonths.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Nenhuma frequência registrada.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sortedMonths.map(({ key, monthYear, records, total, average }) => (
        <Card key={key} className="border border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl capitalize">{monthYear}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Total: <span className="font-medium">{total}</span></span>
                <span>Média: <span className="font-medium">{average}</span></span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="space-y-3">
              {records.map(({ data: record, originalIndex }) => {
                const recordTotal = getTotal(record);
                const isExpanded = expandedRecord === originalIndex;

                return (
                  <div key={originalIndex} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {format(record.date, "EEEE, dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          Total: <span className="font-medium">{recordTotal}</span>
                        </span>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(originalIndex)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir a frequência?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(originalIndex)}>
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRecordDetails(originalIndex)}
                          >
                            {isExpanded ?
                              <ChevronUp className="h-4 w-4" /> :
                              <ChevronDown className="h-4 w-4" />
                            }
                          </Button>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-3 border-t">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2" style={{ color: '#0e0024' }}>
                            <Users className="h-4 w-4" />
                            <span className="font-medium text-sm">Membros</span>
                          </div>
                          <div className="space-y-1 text-sm" style={{ color: '#0e0024' }}>
                            <p>Homens: <span className="font-medium">{record.homens}</span></p>
                            <p>Mulheres: <span className="font-medium">{record.mulheres}</span></p>
                          </div>
                          <p className="text-sm font-medium" style={{ color: '#0e0024' }}>
                            Total: {record.homens + record.mulheres}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2" style={{ color: '#0e0024' }}>
                            <UserPlus className="h-4 w-4" />
                            <span className="font-medium text-sm">Visitantes</span>
                          </div>
                          <div className="space-y-1 text-sm" style={{ color: '#0e0024' }}>
                            <p>Homens: <span className="font-medium">{record.homensVisitantes}</span></p>
                            <p>Mulheres: <span className="font-medium">{record.mulheresVisitantes}</span></p>
                          </div>
                          <p className="text-sm font-medium" style={{ color: '#0e0024' }}>
                            Total: {record.homensVisitantes + record.mulheresVisitantes}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-foreground">
                            <Users className="h-4 w-4" />
                            <span className="font-medium text-sm">Kids</span>
                          </div>
                          <p className="text-sm font-medium text-foreground">
                            Total: {record.kids}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-foreground">
                            <Baby className="h-4 w-4" />
                            <span className="font-medium text-sm">Baby</span>
                          </div>
                          <p className="text-sm font-medium text-foreground">
                            Total: {record.baby}
                          </p>
                        </div>

                        <div className="md:col-span-4 pt-2 border-t">
                          <p className="text-lg font-bold" style={{ color: '#0e0024' }}>
                            Total: <span className="text-1x1">{recordTotal}</span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};