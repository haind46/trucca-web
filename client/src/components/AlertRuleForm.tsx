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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const ruleSchema = z.object({
  name: z.string().min(1, "Tên rule là bắt buộc"),
  condition: z.string().min(1, "Điều kiện là bắt buộc"),
  severity: z.string().min(1, "Mức độ là bắt buộc"),
  description: z.string().optional(),
});

type RuleFormValues = z.infer<typeof ruleSchema>;

interface AlertRuleFormProps {
  onSubmit: (data: RuleFormValues) => void;
  defaultValues?: Partial<RuleFormValues>;
}

export function AlertRuleForm({ onSubmit, defaultValues }: AlertRuleFormProps) {
  const form = useForm<RuleFormValues>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      name: "",
      condition: "",
      severity: "",
      description: "",
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
              <FormLabel>Tên Rule</FormLabel>
              <FormControl>
                <Input {...field} data-testid="input-rule-name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="condition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Điều kiện phát hiện</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  className="font-mono"
                  placeholder="VD: cpu_usage > 90 AND duration > 300"
                  data-testid="input-rule-condition"
                />
              </FormControl>
              <FormDescription>
                Biểu thức điều kiện để phát hiện sự cố
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="severity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mức độ cảnh báo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-rule-severity">
                    <SelectValue placeholder="Chọn mức độ" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="down">Down</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="major">Major</SelectItem>
                  <SelectItem value="minor">Minor</SelectItem>
                  <SelectItem value="clear">Clear</SelectItem>
                </SelectContent>
              </Select>
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
                <Textarea {...field} data-testid="input-rule-description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="submit" data-testid="button-submit-rule">
            Lưu Rule
          </Button>
        </div>
      </form>
    </Form>
  );
}
