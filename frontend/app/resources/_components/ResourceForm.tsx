"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  useCreateResource,
  useUpdateResource,
} from "@/hooks/tanstack-query/useResources";
import { createResourceSchema } from "@/schemas/createResourceSchema";
import { ResourceStatus } from "@/types/resources/enums";
import { resourceStatusOptions, resourceTypeOptions } from "@/types/resources/options";
import { Resource } from "@/types/resources/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PlusCircle, Save } from "lucide-react";
import { useForm } from "react-hook-form";

interface ResourceFormProps {
  initialData?: Resource | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ResourceForm({
  initialData,
  onSuccess,
  onCancel,
}: ResourceFormProps) {
  const isEditing = !!initialData;

  // mutation hooks
  const createResource = useCreateResource();
  const updateResource = useUpdateResource();

  const isSubmitting = createResource.isPending || updateResource.isPending;

  // form setup
  const form = useForm<Resource>({
    resolver: zodResolver(createResourceSchema),
    defaultValues: initialData || {
      id: "",
      name: "",
      capacity: 1,
      type: undefined,
      status: ResourceStatus.AVAILABLE,
    },
  });

  function onSubmit(values: Resource) {
    if (isEditing) {
      updateResource.mutate(values, {
        onSuccess: () => onSuccess(),
      });
    } else {
      // omit id when creating new resource
      const { id, ...newResource } = values;
      createResource.mutate(newResource, {
        onSuccess: () => onSuccess(),
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {/* name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Risorsa</FormLabel>
                <FormControl>
                  <Input placeholder="Es. Camera 101" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* type */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full min-w-0">
                      <SelectValue placeholder="Seleziona tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {resourceTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* capacity */}
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacità</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stato</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full min-w-0">
                      <SelectValue placeholder="Seleziona stato" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {resourceStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          {option.icon && <option.icon className="h-4 w-4 hover:text-foreground" />}
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* action buttons */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => {
              form.reset();
              onCancel();
            }}
          >
            Annulla
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4" />
                Salva
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}