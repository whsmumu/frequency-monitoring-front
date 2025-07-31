import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { format, getYear, setYear, setMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { CaptionProps, useNavigation } from "react-day-picker";

interface AttendanceData {
  date: Date;
  homens: number;
  homensVisitantes: number;
  mulheres: number;
  mulheresVisitantes: number;
  kids: number;
  baby: number;
}

interface ExportDialogProps {
  data: AttendanceData[];
}

// Componente customizado para o cabeçalho do calendário (para navegação dia/mês/ano)
function CustomDayPickerCaption(props: CaptionProps & { onViewChange: () => void }) {
  const { goToMonth, nextMonth, previousMonth } = useNavigation();
  return (
    <h2 className="flex items-center justify-between pt-1 px-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        disabled={!previousMonth}
        onClick={() => previousMonth && goToMonth(previousMonth)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        className="font-semibold text-sm capitalize"
        onClick={props.onViewChange}
      >
        {format(props.displayMonth, 'MMMM yyyy', { locale: ptBR })}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        disabled={!nextMonth}
        onClick={() => nextMonth && goToMonth(nextMonth)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </h2>
  );
}

// Componente para o seletor de data com navegação aprimorada
const DayPickerWithNavigation = ({
  date,
  setDate,
  closePopover,
}: {
  date: Date | undefined;
  setDate: (date?: Date) => void;
  closePopover: () => void;
}) => {
  const [view, setView] = useState<'day' | 'month' | 'year'>('day');
  const [currentDate, setCurrentDate] = useState(date || new Date());

  const handleYearSelect = (year: number) => {
    setCurrentDate(setYear(currentDate, year));
    setView('month');
  };

  const handleMonthSelect = (month: number) => {
    setCurrentDate(setMonth(currentDate, month));
    setView('day');
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 12 }, (_, i) => currentYear - i);

  switch (view) {
    case 'year':
      return (
        <div className="p-2">
          <div className="grid grid-cols-3 gap-1">
            {years.map((year) => (
              <Button
                key={year}
                variant={getYear(date || new Date()) === year ? "default" : "ghost"}
                className="w-full"
                onClick={() => handleYearSelect(year)}
              >
                {year}
              </Button>
            ))}
          </div>
        </div>
      );
    case 'month':
      return (
        <div className="p-3">
          <div className="flex justify-between items-center mb-4">
            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(prev => setYear(prev, getYear(prev) - 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" className="font-semibold text-sm" onClick={() => setView('year')}>
              {getYear(currentDate)}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(prev => setYear(prev, getYear(prev) + 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <Button key={i} variant="ghost" onClick={() => handleMonthSelect(i)}>
                {format(new Date(0, i), 'MMM', { locale: ptBR })}
              </Button>
            ))}
          </div>
        </div>
      );
    default:
      return (
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            if(d) setDate(d);
            closePopover();
          }}
          month={currentDate}
          onMonthChange={setCurrentDate}
          locale={ptBR}
          components={{
            Caption: (props) => <CustomDayPickerCaption {...props} onViewChange={() => setView('month')} />,
          }}
        />
      );
  }
};

export const ExportDialog = ({ data }: ExportDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [exportType, setExportType] = useState<'day' | 'month' | 'year' | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  const { toast } = useToast();

  const exportToCSV = () => {
    let filteredData = data;

    if (exportType !== 'all' && selectedDate) {
      filteredData = data.filter(record => {
        const recordDate = record.date;
        const selectedYear = selectedDate.getFullYear();
        const selectedMonth = selectedDate.getMonth();
        const selectedDay = selectedDate.getDate();

        switch (exportType) {
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
      });
    }

    if (filteredData.length === 0) {
      toast({
        title: "Nenhum dado encontrado",
        description: "Não há registros de frequência para o período selecionado.",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      'Data',
      'Homens Membros',
      'Homens Visitantes',
      'Mulheres Membros',
      'Mulheres Visitantes',
      'Crianças',
      'Bebês',
      'Total'
    ];

    const csvContent = [
      headers.join(';'),
      ...filteredData.map(record => {
        const total = record.homens + record.homensVisitantes + 
                     record.mulheres + record.mulheresVisitantes + 
                     record.kids + record.baby;
        return [
          format(record.date, "dd/MM/yyyy"),
          record.homens,
          record.homensVisitantes,
          record.mulheres,
          record.mulheresVisitantes,
          record.kids,
          record.baby,
          total
        ].join(';');
      })
    ].join('\n');

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    let filename = 'frequencia_igreja';
    if (exportType !== 'all' && selectedDate) {
      switch (exportType) {
        case 'day':
          filename += `_${format(selectedDate, "dd-MM-yyyy")}`;
          break;
        case 'month':
          filename += `_${format(selectedDate, "MM-yyyy")}`;
          break;
        case 'year':
          filename += `_${format(selectedDate, "yyyy")}`;
          break;
      }
    }
    filename += '.csv';
    
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setIsOpen(false);
  };

  const formatButtonLabel = () => {
    if (!selectedDate) {
      return <span>Selecione uma data</span>;
    }
    switch (exportType) {
      case 'day':
        return format(selectedDate, "PPP", { locale: ptBR });
      case 'month':
        return format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR });
      case 'year':
        return format(selectedDate, "yyyy", { locale: ptBR });
      default:
        return <span>Selecione uma data</span>;
    }
  };
  
  const handleMonthSelect = (monthIndex: number) => {
    setSelectedDate(new Date(pickerYear, monthIndex, 1));
    setIsPopoverOpen(false);
  };

  const handleYearSelect = (year: number) => {
    setSelectedDate(new Date(year, 0, 1));
    setIsPopoverOpen(false);
  }

  const years = Array.from({ length: 12 }, (_, i) => new Date().getFullYear() - i);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr" />
          Exportar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar para CSV</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Período de Exportação</label>
            <Select value={exportType} onValueChange={(value: 'day' | 'month' | 'year' | 'all') => setExportType(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Dia Específico</SelectItem>
                <SelectItem value="month">Mês Específico</SelectItem>
                <SelectItem value="year">Ano Específico</SelectItem>
                <SelectItem value="all">Período Completo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {exportType !== 'all' && (
            <div>
              <label className="text-sm font-medium">Data</label>
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatButtonLabel()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start" side="bottom">
                  {exportType === 'day' && (
                    <DayPickerWithNavigation
                        date={selectedDate}
                        setDate={setSelectedDate}
                        closePopover={() => setIsPopoverOpen(false)}
                    />
                  )}
                  {exportType === 'month' && (
                    <div className="p-3">
                      <div className="flex justify-between items-center mb-4">
                        <Button variant="ghost" size="icon" onClick={() => setPickerYear(p => p - 1)}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="font-semibold text-sm">{pickerYear}</span>
                        <Button variant="ghost" size="icon" onClick={() => setPickerYear(p => p + 1)}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <Button
                            key={i}
                            variant={selectedDate?.getMonth() === i && selectedDate?.getFullYear() === pickerYear ? "default" : "ghost"}
                            className="text-center w-full"
                            onClick={() => handleMonthSelect(i)}
                          >
                            {format(new Date(pickerYear, i, 1), 'MMM', { locale: ptBR })}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  {exportType === 'year' && (
                    <div className="p-2 grid grid-cols-3 gap-1">
                      {years.map((year) => (
                        <Button
                          key={year}
                          variant={selectedDate?.getFullYear() === year ? "default" : "ghost"}
                          className="w-full"
                          onClick={() => handleYearSelect(year)}
                        >
                          {year}
                        </Button>
                      ))}
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          )}

          <Button
            onClick={exportToCSV}
            disabled={exportType !== 'all' && !selectedDate}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};