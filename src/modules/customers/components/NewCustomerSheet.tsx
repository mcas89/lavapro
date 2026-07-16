import { useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customerSchema, type CustomerFormValues } from "../schemas/customerSchema";
import { BottomSheet } from "@/components/shared/BottomSheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/db";
import { useState, useEffect } from "react";

export function NewCustomerSheet() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isOpen = searchParams.get("newCustomer") === "true";
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
    },
  });

  useEffect(() => {
    if (isOpen) form.reset();
  }, [isOpen, form]);

  const handleClose = () => {
    searchParams.delete("newCustomer");
    setSearchParams(searchParams, { replace: true });
  };

  const onSubmit = async (data: CustomerFormValues) => {
    setLoading(true);
    try {
      const doc = await db.addDoc("customers", { 
        ...data, 
        totalSpent: 0, 
        lastVisit: "-" 
      });
      
      toast({
        title: "Cliente cadastrado!",
        description: "O perfil de " + data.name + " foi criado.",
      });

      // Redireciona imediatamente para o cadastro de veículo deste cliente
      searchParams.delete("newCustomer");
      searchParams.set("newVehicle", "true");
      searchParams.set("targetCustomer", doc.id);
      setSearchParams(searchParams, { replace: true });
    } catch (e) {
      toast({ title: "Erro", description: "Não foi possível salvar o cliente.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title="Novo Cliente">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pb-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Carlos Oliveira" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp</FormLabel>
                <FormControl>
                  <Input placeholder="(11) 99999-9999" type="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Rua, Número, Bairro" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? "Salvando..." : "Salvar e Adicionar Veículo"}
          </Button>
        </form>
      </Form>
    </BottomSheet>
  );
}
