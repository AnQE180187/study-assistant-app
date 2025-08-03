"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAiLogs, useDeleteAiLog } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Search, Eye, Trash2, Brain, MessageSquare } from "lucide-react";
import { AiLog } from "@/types";

export default function AiLogsPage() {
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<AiLog | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: logs, isLoading, error } = useAiLogs();
  const deleteLogMutation = useDeleteAiLog();

  const filteredLogs = logs?.filter(
    (log) =>
      log.prompt.toLowerCase().includes(search.toLowerCase()) ||
      log.response.toLowerCase().includes(search.toLowerCase()) ||
      log.user.name.toLowerCase().includes(search.toLowerCase()) ||
      log.user.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleViewLog = (log: AiLog) => {
    setSelectedLog(log);
    setShowDetailDialog(true);
  };

  const handleDeleteLog = async () => {
    if (!selectedLog) return;

    try {
      await deleteLogMutation.mutateAsync(selectedLog.id);
      toast.success("Xóa log thành công");
      setShowDeleteDialog(false);
      setSelectedLog(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col">
        <Header title="Quản lý AI Logs" />
        <div className="flex-1 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col">
        <Header title="Quản lý AI Logs" />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không thể tải dữ liệu
            </h3>
            <p className="text-gray-500">Vui lòng thử lại sau</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Quản lý AI Logs" />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Stats Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng AI Logs</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Tổng số lượt tương tác với AI
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách AI Logs</CardTitle>
            <CardDescription>
              Theo dõi tất cả tương tác với AI trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="flex items-center space-x-2 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo prompt, response hoặc người dùng..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Logs Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prompt</TableHead>
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Response</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead className="text-right w-32">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs?.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {log.prompt.substring(0, 50)}
                            {log.prompt.length > 50 && "..."}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">
                            {log.user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {log.user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm text-gray-700 truncate">
                            {log.response.substring(0, 80)}
                            {log.response.length > 80 && "..."}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(log.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewLog(log);
                            }}
                            className="h-8 w-8 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLog(log);
                              setShowDeleteDialog(true);
                            }}
                            className="h-8 w-8 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors"
                            title="Xóa log"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredLogs?.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Không tìm thấy log nào</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Log Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết AI Log</DialogTitle>
            <DialogDescription>
              {selectedLog?.user.name} •{" "}
              {selectedLog && formatDate(selectedLog.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Prompt:
                </h4>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap text-sm">
                    {selectedLog.prompt}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <Brain className="h-4 w-4 mr-2" />
                  AI Response:
                </h4>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap text-sm">
                    {selectedLog.response}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa log này? Hành động này không thể hoàn
              tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteLog}
              disabled={deleteLogMutation.isPending}
            >
              {deleteLogMutation.isPending ? "Đang xóa..." : "Xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
