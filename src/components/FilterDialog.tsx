import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { format, getYear, setYear, setMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CaptionProps, useNavigation } from "react-day-picker";

interface FilterDialogProps {
  onApplyFilter: (type: 'day' | 'month' | 'year', date?: Date) => void;
  onClearFilter: () => void;
}

// Componente customizado para o cabeçalho do calendário
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

// Componente para o seletor de data aprimorado
const CustomDatePicker = ({
  date,
  setDate,
  closePopover,
  filterType
}: {
  date: Date | undefined;
  setDate: (date?: Date) => void;
  closePopover: () => void;
  filterType: 'day' | 'month' | 'year';
}) => {
  const [view, setView] = useState<'day' | 'month' | 'year'>(filterType);
  const [currentDate, setCurrentDate] = useState(date || new Date());

  const handleYearSelect = (year: number) => {
    const newDate = setYear(currentDate, year);
    setCurrentDate(newDate);
    if (filterType === 'year') {
      setDate(newDate);
      closePopover();
    } else {
      setView('month');
    }
  };

  const handleMonthSelect = (month: number) => {
    const newDate = setMonth(currentDate, month);
    setCurrentDate(newDate);
    if (filterType === 'month') {
        setDate(newDate);
        closePopover();
    } else {
        setView('day');
    }
  };
  
  // CORREÇÃO: Lógica do seletor de ano
  switch (view) {
    case 'year':
      const currentYear = new Date().getFullYear();
      const years = Array.from({ length: 12 }, (_, i) => currentYear - i);
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
            if(d) {
              setDate(d);
            }
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


export const FilterDialog = ({ onApplyFilter, onClearFilter }: FilterDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [filterType, setFilterType] = useState<'day' | 'month' | 'year'>('day');
  const [selectedDate, setSelectedDate] = useState<Date>();

  const handleApplyFilter = () => {
    if (selectedDate) {
      onApplyFilter(filterType, selectedDate);
      setIsOpen(false);
    }
  };

  const handleClearFilter = () => {
    onClearFilter();
    setSelectedDate(undefined);
    setIsOpen(false);
  };

  const formatButtonLabel = () => {
    if (!selectedDate) {
      return <span>Selecione uma data</span>;
    }
    switch (filterType) {
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr" />
          Filtrar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filtrar Dados</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Tipo de Filtro</label>
            <Select value={filterType} onValueChange={(value: 'day' | 'month' | 'year') => setFilterType(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Data Específica</SelectItem>
                <SelectItem value="month">Mês</SelectItem>
                <SelectItem value="year">Ano</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
                <CustomDatePicker
                  date={selectedDate}
                  setDate={setSelectedDate}
                  closePopover={() => setIsPopoverOpen(false)}
                  filterType={filterType}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleClearFilter}
              className="flex-1"
            >
              Limpar Filtro
            </Button>
            <Button
              onClick={handleApplyFilter}
              disabled={!selectedDate}
              className="flex-1"
            >
              Aplicar Filtro
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};