import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const operationTypeFormSchema = z.object({
  operationTypeCode: z
    .string()
    .min(1, "Mã loại vận hành là bắt buộc")
    .max(255, "Mã loại vận hành không được quá 255 ký tự")
    .regex(/^[A-Z0-9_]+$/, "Mã chỉ được chứa chữ hoa, số và dấu gạch dưới"),
  operationTypeName: z
    .string()
    .min(1, "Tên loại vận hành là bắt buộc")
    .max(255, "Tên loại vận hành không được quá 255 ký tự"),
  description: z
    .string()
    .max(1000, "Mô tả không được quá 1000 ký tự")
    .optional()
    .or(z.literal("")),
  note: z
    .string()
    .max(1000, "Ghi chú không được quá 1000 ký tự")
    .optional()
    .or(z.literal("")),
});

export type OperationTypeFormValues = z.infer<typeof operationTypeFormSchema>;

interface OperationTypeFormProps {
  onSubmit: (data: OperationTypeFormValues) => void;
  isPending?: boolean;
  defaultValues?: Partial<OperationTypeFormValues>;
  submitText?: string;
}

export function OperationTypeForm({
  onSubmit,
  isPending = false,
  defaultValues,
  submitText = "Lưu",
}: OperationTypeFormProps) {
  const form = useForm<OperationTypeFormValues>({
    resolver: zodResolver(operationTypeFormSchema),
    defaultValues: {
      operationTypeCode: defaultValues?.operationTypeCode || "",
      operationTypeName: defaultValues?.operationTypeName || "",
      description: defaultValues?.description || "",
      note: defaultValues?.note || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="operationTypeCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mã loại vận hành *</FormLabel>
              <FormControl>
                <Input
                  placeholder="VD: OS, DATABASE, APPLICATION"
                  {...field}
                  className="font-mono"
                  disabled={isPending}
                />
              </FormControl>
              <FormDescription className="text-xs">
                Chỉ sử dụng chữ hoa (A-Z), số (0-9) và dấu gạch dưới (_)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="operationTypeName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên loại vận hành *</FormLabel>
              <FormControl>
                <Input
                  placeholder="VD: Hệ điều hành (Operating System)"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Mô tả chi tiết về loại vận hành này..."
                  className="min-h-[100px] resize-none"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormDescription className="text-xs">
                Tối đa 1000 ký tự
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ghi chú</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ghi chú bổ sung (nếu có)..."
                  className="min-h-[80px] resize-none"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormDescription className="text-xs">
                Tối đa 1000 ký tự
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Đang xử lý..." : submitText}
          </Button>
        </div>
      </form>
    </Form>
  );
}
