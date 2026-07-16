import { useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vehicleSchema, type VehicleFormValues } from "../schemas/customerSchema";
import { BottomSheet } from "@/components/shared/BottomSheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/db";
import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";

export function NewVehicleSheet() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isOpen = searchParams.get("newVehicle") === "true";
  const editId = searchParams.get("editVehicle");
  const isEdit = !!editId;
  const isSheetOpen = isOpen || isEdit;

  const targetCustomer = searchParams.get("targetCustomer");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      plate: "",
      brand: "",
      model: "",
      color: "",
    },
  });

  useEffect(() => {
    async function loadVehicle() {
      if (editId) {
        setLoading(true);
        const doc = await db.getDoc<any>("vehicles", editId);
        if (doc) {
          form.reset({
            plate: doc.plate || "",
            brand: doc.brand || "",
            model: doc.model || "",
            color: doc.color || "",
          });
        }
        setLoading(false);
      }
    }

    if (isSheetOpen) {
      if (editId) {
        loadVehicle();
      } else {
        form.reset();
      }
    }
  }, [isSheetOpen, editId, form]);

  const handleClose = () => {
    searchParams.delete("newVehicle");
    searchParams.delete("editVehicle");
    searchParams.delete("targetCustomer");
    setSearchParams(searchParams, { replace: true });
  };

  const onSubmit = async (data: VehicleFormValues) => {
    // Se for um novo carro, precisamos do targetCustomer
    if (!isEdit && !targetCustomer) {
      toast({ title: "Erro", description: "Nenhum cliente vinculado a este veículo.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...data,
        plate: data.plate.toUpperCase()
      };

      if (isEdit && editId) {
        await db.updateDoc("vehicles", editId, payload);
        toast({ title: "Veículo atualizado!", description: "As informações foram salvas com sucesso." });
      } else {
        await db.addDoc("vehicles", {
          ...payload,
          customerId: targetCustomer,
        });
        toast({ title: "Veículo salvo!", description: `O ${data.brand} ${data.model} (${data.plate}) foi adicionado à garagem.` });
      }
      
      handleClose();
    } catch (e) {
      toast({ title: "Erro", description: "Não foi possível salvar o veículo.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editId) return;
    if (confirm("Tem certeza que deseja excluir este veículo da garagem do cliente?")) {
      setLoading(true);
      try {
        await db.deleteDoc("vehicles", editId);
        toast({ title: "Veículo excluído", description: "O carro foi removido da garagem." });
        handleClose();
      } catch (e) {
        toast({ title: "Erro", description: "Não foi possível excluir o veículo.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <BottomSheet isOpen={isSheetOpen} onClose={handleClose} title={isEdit ? "Editar Veículo" : "Adicionar Veículo"}>
      {isEdit && (
        <div className="absolute top-4 right-12 z-50">
          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleDelete}>
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pb-6">
          <FormField
            control={form.control}
            name="plate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Placa</FormLabel>
                <FormControl>
                  <Input placeholder="ABC-1234" className="uppercase" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
              <FormItem>
                <FormLabel>Marca</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: VW, Fiat" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
              <FormItem>
                <FormLabel>Modelo</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Gol" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cor (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Prata, Preto" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? "Salvando..." : (isEdit ? "Atualizar Veículo" : "Salvar Veículo")}
          </Button>
        </form>
      </Form>
    </BottomSheet>
  );
}
