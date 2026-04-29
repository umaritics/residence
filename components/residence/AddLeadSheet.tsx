"use client";

import { useState } from "react";
import { useSWRConfig } from "swr";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LeadSchema } from "@/lib/validations";
import {
  Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { User, Phone, Mail, Wallet, Home, FileText, Calendar } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

type AddLeadFormValues = z.input<typeof LeadSchema>;

export function AddLeadSheet({ open, onOpenChange }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const { mutate } = useSWRConfig();
  
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<AddLeadFormValues>({
    resolver: zodResolver(LeadSchema)
  });

  const onSubmit = async (data: AddLeadFormValues) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        // We use 'as string' to satisfy TypeScript's type checker
        nextFollowUp: data.nextFollowUp ? new Date(data.nextFollowUp as string).toISOString() : undefined,
      };

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create lead");

      mutate("/api/leads");
      mutate("/api/activity"); 
      
      toast.success("Lead created", { description: "The new lead has been added to your pipeline." });
      reset();
      onOpenChange(false);
    } catch (err) {
      toast.error("Error", { description: "Failed to create lead. Check date format." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="p-6 border-b border-border">
          <SheetTitle className="font-display text-xl">Add New Lead</SheetTitle>
          <SheetDescription>
            Capture a new prospect's details. You can update them anytime.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
          <Field icon={User} label="Full name" htmlFor="name">
            <Input id="name" placeholder="e.g. Hamza Iqbal" {...register("name")} />
            {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field icon={Phone} label="Phone" htmlFor="phone">
              <Input id="phone" type="tel" placeholder="+92 3XX XXXXXXX" {...register("phone")} />
              {errors.phone && <p className="text-xs text-danger">{errors.phone.message}</p>}
            </Field>
            <Field icon={Mail} label="Email (Optional)" htmlFor="email">
              <Input id="email" type="email" placeholder="name@example.com" {...register("email")} />
              {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
            </Field>
          </div>

          <Field icon={Wallet} label="Budget (PKR)" htmlFor="budget">
            <Input id="budget" type="number" placeholder="e.g. 25000000" {...register("budget", { valueAsNumber: true })} />
            {errors.budget && <p className="text-xs text-danger">{errors.budget.message}</p>}
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Tip: Leads above PKR 20M are auto-tagged as <span className="text-success font-medium">High Priority</span>.
            </p>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field icon={Home} label="Property type" htmlFor="propertyInterest">
              <Controller
                name="propertyInterest"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="propertyInterest"><SelectValue placeholder="Select property type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Residential Plot">Residential Plot</SelectItem>
                      <SelectItem value="Villa / House">Villa / House</SelectItem>
                      <SelectItem value="Apartment">Apartment</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                      <SelectItem value="Farmhouse">Farmhouse</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.propertyInterest && <p className="text-xs text-danger">{errors.propertyInterest.message}</p>}
            </Field>

            <Field icon={Calendar} label="Next Follow-up" htmlFor="nextFollowUp">
              <Input id="nextFollowUp" type="datetime-local" {...register("nextFollowUp")} />
              {errors.nextFollowUp && <p className="text-xs text-danger">{errors.nextFollowUp.message}</p>}
            </Field>
          </div>

          <Field icon={FileText} label="Notes" htmlFor="notes">
            <Textarea id="notes" rows={4} placeholder="Add context: budget flexibility, preferred location, urgency…" {...register("notes")} />
          </Field>
        </form>

        <SheetFooter className="p-6 border-t border-border bg-muted/20">
          <div className="flex w-full gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleSubmit(onSubmit)} disabled={submitting} className="flex-1 bg-primary hover:bg-primary/90 shadow-glow">
              {submitting ? "Saving…" : "Save lead"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function Field({
  icon: Icon, label, htmlFor, children,
}: { icon: typeof User; label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        {label}
      </Label>
      {children}
    </div>
  );
}
