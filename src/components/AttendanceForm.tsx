import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Users, UserPlus, Baby, Heart } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface AttendanceData {
  date: Date;
  homens: number;
  homensVisitantes: number;
  mulheres: number;
  mulheresVisitantes: number;
  kids: number;
  baby: number;
}

interface AttendanceFormProps {
  onSubmit: (data: AttendanceData) => void;
  onClose: () => void;
  initialData?: AttendanceData;
}

export const AttendanceForm = ({ onSubmit, onClose, initialData }: AttendanceFormProps) => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(initialData?.date || new Date());
  const [homens, setHomens] = useState<number>(initialData?.homens || 0);
  const [homensVisitantes, setHomensVisitantes] = useState<number>(initialData?.homensVisitantes || 0);
  const [mulheres, setMulheres] = useState<number>(initialData?.mulheres || 0);
  const [mulheresVisitantes, setMulheresVisitantes] = useState<number>(initialData?.mulheresVisitantes || 0);
  const [kids, setKids] = useState<number>(initialData?.kids || 0);
  const [baby, setBaby] = useState<number>(initialData?.baby || 0);

  const total = homens + homensVisitantes + mulheres + mulheresVisitantes + kids + baby;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (total === 0) {
      toast({
        title: "Atenção",
        description: "Por favor, insira pelo menos uma pessoa na frequência.",
        variant: "destructive"
      });
      return;
    }

    const attendanceData: AttendanceData = {
      date,
      homens,
      homensVisitantes,
      mulheres,
      mulheresVisitantes,
      kids,
      baby
    };

    onSubmit(attendanceData);
    toast({
      title: initialData ? "Frequência atualizada!" : "Frequência registrada!",
      description: `Total de ${total} pessoas no culto de ${format(date, "dd/MM/yyyy", { locale: ptBR })}.`,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="date" className="text-base font-medium">Data do Culto</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal mt-1",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                initialFocus
                className="p-3 pointer-events-auto"
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Users className="h-5 w-5" />
              <span className="font-semibold">Homens</span>
            </div>

            <div>
              <Label htmlFor="homens">Membros</Label>
              <Input
                id="homens"
                type="number"
                min="0"
                value={homens}
                onChange={(e) => setHomens(parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="homensVisitantes" className="flex items-center gap-1">
                Visitantes
                <UserPlus className="h-3 w-3 text-primary" />
              </Label>
              <Input
                id="homensVisitantes"
                type="number"
                min="0"
                value={homensVisitantes}
                onChange={(e) => setHomensVisitantes(parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Heart className="h-5 w-5" />
              <span className="font-semibold">Mulheres</span>
            </div>

            <div>
              <Label htmlFor="mulheres">Membros</Label>
              <Input
                id="mulheres"
                type="number"
                min="0"
                value={mulheres}
                onChange={(e) => setMulheres(parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="mulheresVisitantes" className="flex items-center gap-1">
                Visitantes
                <UserPlus className="h-3 w-3 text-primary" />
              </Label>
              <Input
                id="mulheresVisitantes"
                type="number"
                min="0"
                value={mulheresVisitantes}
                onChange={(e) => setMulheresVisitantes(parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="kids" className="flex items-center gap-2 text-primary">
              <Users className="h-4 w-4" />
              Kids (5-12 anos)
            </Label>
            <Input
              id="kids"
              type="number"
              min="0"
              value={kids}
              onChange={(e) => setKids(parseInt(e.target.value) || 0)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="baby" className="flex items-center gap-2 text-primary">
              <Baby className="h-4 w-4" />
              Baby (1-4 anos)
            </Label>
            <Input
              id="baby"
              type="number"
              min="0"
              value={baby}
              onChange={(e) => setBaby(parseInt(e.target.value) || 0)}
              className="mt-1"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-input">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total de Pessoas</p>
            <p className="text-3xl font-bold text-foreground">{total}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="flex-1"
        >
          {initialData ? "Atualizar Frequência" : "Registrar Frequência"}
        </Button>
      </div>
    </form>
  );
};