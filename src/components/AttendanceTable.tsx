import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AttendanceData {
  date: Date;
  homens: number;
  homensVisitantes: number;
  mulheres: number;
  mulheresVisitantes: number;
  kids: number;
  baby: number;
}

interface AttendanceTableProps {
  data: AttendanceData[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

export const AttendanceTable = ({ data, onEdit, onDelete }: AttendanceTableProps) => {
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  
  // Mapear dados com índices originais antes da ordenação
  const dataWithOriginalIndex = data.map((item, index) => ({ ...item, originalIndex: index }));
  const sortedData = [...dataWithOriginalIndex].sort((a, b) => b.date.getTime() - a.date.getTime());

  const getAttendanceBadge = (total: number) => {
    if (total >= 100) return { variant: "default" as const, text: "Excelente", className: "bg-green-500 text-white" };
    if (total >= 50) return { variant: "default" as const, text: "Bom", className: "bg-blue-500 text-white" };
    if (total >= 20) return { variant: "default" as const, text: "Regular", className: "bg-orange-500 text-white" };
    return { variant: "secondary" as const, text: "Baixo", className: "" };
  };

  return (
    <Card className="border border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">
          Histórico de Frequências
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold text-center">Data</TableHead>
                <TableHead className="font-semibold text-center">Homens</TableHead>
                <TableHead className="font-semibold text-center">Mulheres</TableHead>
                <TableHead className="font-semibold text-center">Visitantes</TableHead>
                <TableHead className="font-semibold text-center">Crianças</TableHead>
                <TableHead className="font-semibold text-center">Total</TableHead>
                <TableHead className="font-semibold text-center">Status</TableHead>
                <TableHead className="font-semibold text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((attendance, index) => {
                const total = attendance.homens + attendance.homensVisitantes + 
                             attendance.mulheres + attendance.mulheresVisitantes + 
                             attendance.kids + attendance.baby;
                const totalVisitantes = attendance.homensVisitantes + attendance.mulheresVisitantes;
                const totalCriancas = attendance.kids + attendance.baby;
                const badge = getAttendanceBadge(total);

                return (
                  <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium text-center">
                      {format(attendance.date, "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span>{attendance.homens}</span>
                        {attendance.homensVisitantes > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            +{attendance.homensVisitantes}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span>{attendance.mulheres}</span>
                        {attendance.mulheresVisitantes > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            +{attendance.mulheresVisitantes}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-green-600 font-medium">{totalVisitantes}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-orange-600 font-medium">{totalCriancas}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-lg font-bold text-primary">{total}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={badge.variant} className={badge.className}>
                        {badge.text}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(attendance.originalIndex)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteIndex(attendance.originalIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja remover esta frequência?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  if (deleteIndex !== null) {
                                    onDelete(deleteIndex);
                                    setDeleteIndex(null);
                                  }
                                }}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Confirmar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {sortedData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma frequência registrada ainda.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};