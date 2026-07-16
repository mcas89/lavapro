import { useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { serviceSchema, type ServiceFormValues } from "../schemas/serviceSchema";
import { BottomSheet } from "@/components/shared/BottomSheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/db";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export function NewServiceSheet() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isOpen = searchParams.get("newService") === "true";
  const serviceId = searchParams.get("serviceId");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema) as any,
    defaultValues: {
      name: "",
      price: 0,
      estimatedTime: 30,
      description: "",
    },
  });

  useEffect(() => {
    async function loadService() {
      if (isOpen && serviceId) {
        const service = await db.getDoc<any>("services", serviceId);
        if (service) {
          form.reset({
            name: service.name,
            price: service.price,
            estimatedTime: service.estimatedTime || service.duration || 30, // Fallback p/ duration legado
            description: service.description || "",
          });
        }
      } else if (isOpen && !serviceId) {
        form.reset({
          name: "",
          price: 0,
          estimatedTime: 30,
          description: "",
        });
      }
    }
    loadService();
  }, [isOpen, serviceId, form]);

  const handleClose = () => {
    searchParams.delete("newService");
    searchParams.delete("serviceId");
    setSearchParams(searchParams, { replace: true });
  };

  const onSubmit = async (data: ServiceFormValues) => {
    setLoading(true);
    try {
      if (serviceId) {
        await db.updateDoc("services", serviceId, data);
      } else {
        await db.addDoc("services", data);
      }
      toast({
        title: "Serviço salvo!",
        description: `O serviço ${data.name} foi ${serviceId ? "atualizado" : "criado"}.`,
      });
      handleClose();
    } catch (e) {
      toast({ title: "Erro", description: "Não foi possível salvar o serviço.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!serviceId) return;
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return;
    
    setLoading(true);
    try {
      await db.deleteDoc("services", serviceId);
      toast({
        title: "Serviço excluído",
        description: "O serviço foi removido com sucesso.",
      });
      handleClose();
    } catch (e) {
      toast({ title: "Erro", description: "Não foi possível excluir o serviço.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={serviceId ? "Editar Serviço" : "Novo Serviço"}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pb-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
               <FormItem>
                 <FormLabel>Nome do Serviço</FormLabel>
                 <FormControl>
                   <Input placeholder="Ex: Lavagem Simples" {...field} />
                 </FormControl>
                 <FormMessage />
               </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                 <FormItem>
                   <FormLabel>Preço (R$)</FormLabel>
                   <FormControl>
                     <Input type="number" step="0.01" placeholder="Ex: 50.00" {...field} value={field.value ?? ""} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                   </FormControl>
                   <FormMessage />
                 </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="estimatedTime"
              render={({ field }) => (
                 <FormItem>
                   <FormLabel>Duração (min)</FormLabel>
                   <FormControl>
                     <Input type="number" step="5" placeholder="Ex: 45" {...field} value={field.value ?? ""} onChange={(e) => field.onChange(parseInt(e.target.value, 10))} />
                   </FormControl>
                   <FormMessage />
                 </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
               <FormItem>
                 <FormLabel>Descrição (Opcional)</FormLabel>
                 <FormControl>
                   <Textarea 
                     placeholder="O que está incluso neste serviço?" 
                     className="resize-none"
                     {...field} 
                   />
                 </FormControl>
                 <FormMessage />
               </FormItem>
            )}
          />

          <div className="flex gap-3 pt-2">
            {serviceId && (
              <Button type="button" variant="destructive" size="icon" className="shrink-0" onClick={handleDelete} disabled={loading}>
                <Trash2 className="h-5 w-5" />
              </Button>
            )}
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Salvando..." : (serviceId ? "Atualizar Serviço" : "Criar Serviço")}
            </Button>
          </div>
        </form>
      </Form>
    </BottomSheet>
  );
}
