"use client";

import { useState, useEffect } from "react";
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
  lead: any | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

type EditLeadFormValues = z.input<typeof LeadSchema>;

export function EditLeadSheet({ lead, open, onOpenChange }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const { mutate } = useSWRConfig();
  
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<EditLeadFormValues>({
    resolver: zodResolver(LeadSchema)
  });

  // Pre-fill the form whenever a new lead is selected
  useEffect(() => {
    if (lead) {
      reset({
        name: lead.name,
        phone: lead.phone,
        email: lead.email || "",
        budget: lead.budget,
        propertyInterest: lead.propertyInterest,
        notes: lead.notes || "",
        // Format date for the datetime-local input
        nextFollowUp: lead.nextFollowUp ? new Date(lead.nextFollowUp).toISOString().slice(0, 16) : "",
      });
    }
  }, [lead, reset]);

  const onSubmit = async (data: EditLeadFormValues) => {
    if (!lead) return;
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        nextFollowUp: data.nextFollowUp ? new Date(data.nextFollowUp as string).toISOString() : undefined,
      };

      const res = await fetch(`/api/leads/${lead._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update lead");

      mutate("/api/leads");
      mutate("/api/activity"); 
      
      toast.success("Lead updated", { description: "The details have been saved." });
      onOpenChange(false);
    } catch (err) {
      toast.error("Error", { description: "Failed to update lead details." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="p-6 border-b border-border">
          <SheetTitle className="font-display text-xl">Edit Lead</SheetTitle>
          <SheetDescription>Update contact details, budget, or property interest.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
          <Field icon={User} label="Full name" htmlFor="edit-name">
            <Input id="edit-name" placeholder="e.g. Hamza Iqbal" {...register("name")} />
            {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field icon={Phone} label="Phone" htmlFor="edit-phone">
              <Input id="edit-phone" type="tel" placeholder="+92 3XX XXXXXXX" {...register("phone")} />
              {errors.phone && <p className="text-xs text-danger">{errors.phone.message}</p>}
            </Field>
            <Field icon={Mail} label="Email (Optional)" htmlFor="edit-email">
              <Input id="edit-email" type="email" placeholder="name@example.com" {...register("email")} />
              {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
            </Field>
          </div>

          <Field icon={Wallet} label="Budget (PKR)" htmlFor="edit-budget">
            <Input id="edit-budget" type="number" placeholder="e.g. 25000000" {...register("budget", { valueAsNumber: true })} />
            {errors.budget && <p className="text-xs text-danger">{errors.budget.message}</p>}
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field icon={Home} label="Property type" htmlFor="edit-propertyInterest">
              <Controller
                name="propertyInterest"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="edit-propertyInterest"><SelectValue placeholder="Select property type" /></SelectTrigger>
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

            <Field icon={Calendar} label="Next Follow-up" htmlFor="edit-nextFollowUp">
              <Input id="edit-nextFollowUp" type="datetime-local" {...register("nextFollowUp")} />
              {errors.nextFollowUp && <p className="text-xs text-danger">{errors.nextFollowUp.message}</p>}
            </Field>
          </div>

          <Field icon={FileText} label="Notes" htmlFor="edit-notes">
            <Textarea id="edit-notes" rows={4} placeholder="Add context..." {...register("notes")} />
          </Field>
        </form>

        <SheetFooter className="p-6 border-t border-border bg-muted/20">
          <div className="flex w-full gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" onClick={handleSubmit(onSubmit)} disabled={submitting} className="flex-1 bg-primary hover:bg-primary/90 shadow-glow">
              {submitting ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function Field({ icon: Icon, label, htmlFor, children }: { icon: typeof User; label: string; htmlFor: string; children: React.ReactNode }) {
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