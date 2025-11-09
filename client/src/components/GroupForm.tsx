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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGroupSchema } from "@shared/schema";
import type { InsertGroup } from "@shared/schema";

interface GroupFormProps {
  onSubmit: (data: InsertGroup) => void;
  defaultValues?: Partial<InsertGroup>;
  isPending?: boolean;
}

export function GroupForm({ onSubmit, defaultValues, isPending }: GroupFormProps) {
  const form = useForm<InsertGroup>({
    resolver: zodResolver(insertGroupSchema),
    defaultValues: {
      name: "",
      chatworkGroupId: "",
      memberIds: [],
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên nhóm</FormLabel>
              <FormControl>
                <Input {...field} data-testid="input-group-name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="chatworkGroupId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chatwork Group ID</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} data-testid="input-group-chatwork" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="submit" data-testid="button-submit-group" disabled={isPending}>
            {isPending ? "Đang lưu..." : "Lưu Group"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
