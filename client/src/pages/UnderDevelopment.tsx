import { Construction } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function UnderDevelopment() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
              <Construction className="w-10 h-10 text-amber-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Giao diện đang phát triển</CardTitle>
          <CardDescription className="text-base mt-2">
            Tính năng này đang được phát triển và sẽ sớm có mặt trong phiên bản tiếp theo
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>Vui lòng quay lại sau hoặc liên hệ quản trị viên để biết thêm thông tin</p>
        </CardContent>
      </Card>
    </div>
  );
}
