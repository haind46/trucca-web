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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSystemSchema } from "@shared/schema";
import type { InsertSystem } from "@shared/schema";

interface SystemFormProps {
  onSubmit: (data: InsertSystem) => void;
  defaultValues?: Partial<InsertSystem>;
  isPending?: boolean;
}

export function SystemForm({ onSubmit, defaultValues, isPending }: SystemFormProps) {
  const form = useForm<InsertSystem>({
    resolver: zodResolver(insertSystemSchema),
    defaultValues: {
      name: "",
      ip: "",
      level: 1,
      polestarCode: "",
      chatworkGroupId: "",
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên hệ thống</FormLabel>
                <FormControl>
                  <Input {...field} data-testid="input-system-name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ip"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Địa chỉ IP</FormLabel>
                <FormControl>
                  <Input {...field} className="font-mono" data-testid="input-system-ip" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cấp độ hệ thống</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))} 
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger data-testid="select-system-level">
                      <SelectValue placeholder="Chọn cấp độ" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Level 1 - Hệ thống lõi</SelectItem>
                    <SelectItem value="2">Level 2 - Hệ thống trung gian</SelectItem>
                    <SelectItem value="3">Level 3 - Hệ thống không trọng yếu</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Level 1: Ảnh hưởng toàn mạng, Level 2: Ảnh hưởng gián tiếp, Level 3: Dev/Test
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="polestarCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mã PoleStar</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} className="font-mono" data-testid="input-system-polestar" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="chatworkGroupId"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Chatwork Group ID</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} data-testid="input-system-chatwork" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="submit" data-testid="button-submit-system" disabled={isPending}>
            {isPending ? "Đang lưu..." : "Lưu Hệ thống"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
