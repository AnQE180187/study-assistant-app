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
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNotes } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import {
  Search,
  Eye,
  MessageSquare,
  AlertCircle,
  Clock,
  Zap,
} from "lucide-react";
import { Note } from "@/types";

const priorityConfig = {
  low: { label: "Thấp", color: "bg-gray-100 text-gray-800", icon: Clock },
  medium: {
    label: "Trung bình",
    color: "bg-blue-100 text-blue-800",
    icon: MessageSquare,
  },
  high: {
    label: "Cao",
    color: "bg-orange-100 text-orange-800",
    icon: AlertCircle,
  },
  urgent: { label: "Khẩn cấp", color: "bg-red-100 text-red-800", icon: Zap },
};

export default function NotesPage() {
  const [search, setSearch] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const { data: notes, isLoading, error } = useNotes();

  const filteredNotes = notes?.filter(
    (note) =>
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase()) ||
      note.user.name.toLowerCase().includes(search.toLowerCase()) ||
      note.user.email.toLowerCase().includes(search.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
  );

  const handleViewNote = (note: Note) => {
    setSelectedNote(note);
    setShowDetailDialog(true);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col">
        <Header title="Quản lý Ghi chú" />
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
        <Header title="Quản lý Ghi chú" />
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

  // Stats by priority
  const statsByPriority =
    notes?.reduce((acc, note) => {
      acc[note.priority] = (acc[note.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Quản lý Ghi chú" />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Object.entries(priorityConfig).map(([priority, config]) => {
            const Icon = config.icon;
            return (
              <Card key={priority}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {config.label}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsByPriority[priority] || 0}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách Ghi chú</CardTitle>
            <CardDescription>
              Quản lý tất cả ghi chú trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="flex items-center space-x-2 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo tiêu đề, nội dung, người tạo hoặc tags..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Notes Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ghi chú</TableHead>
                    <TableHead>Người tạo</TableHead>
                    <TableHead>Độ ưu tiên</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right w-24">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotes?.map((note) => {
                    const priorityInfo =
                      priorityConfig[
                        note.priority as keyof typeof priorityConfig
                      ];
                    return (
                      <TableRow
                        key={note.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">
                              {note.title}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {note.content.substring(0, 100)}
                              {note.content.length > 100 && "..."}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">
                              {note.user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {note.user.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={priorityInfo.color}>
                            {priorityInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {note.tags.slice(0, 2).map((tag, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {note.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{note.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(note.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewNote(note);
                              }}
                              className="h-8 w-8 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                              title="Xem chi tiết"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {filteredNotes?.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Không tìm thấy ghi chú nào</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Note Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedNote?.title}</DialogTitle>
            <DialogDescription>
              Tạo bởi {selectedNote?.user.name} •{" "}
              {selectedNote && formatDate(selectedNote.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {selectedNote && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge
                  className={
                    priorityConfig[
                      selectedNote.priority as keyof typeof priorityConfig
                    ].color
                  }
                >
                  {
                    priorityConfig[
                      selectedNote.priority as keyof typeof priorityConfig
                    ].label
                  }
                </Badge>
              </div>

              {selectedNote.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Tags:</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedNote.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium mb-2">Nội dung:</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap text-sm">
                    {selectedNote.content}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
