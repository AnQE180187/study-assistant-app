"use client";

import { useState } from "react";
import Link from "next/link";
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
import { useDecks } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import { Search, Eye, BookOpen, Users } from "lucide-react";

export default function FlashcardsPage() {
  const [search, setSearch] = useState("");
  const { data: decks, isLoading, error } = useDecks();

  const filteredDecks = decks?.filter(
    (deck) =>
      deck.title.toLowerCase().includes(search.toLowerCase()) ||
      deck.user.name.toLowerCase().includes(search.toLowerCase()) ||
      deck.user.email.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col">
        <Header title="Quản lý Flashcards" />
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
        <Header title="Quản lý Flashcards" />
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
      <Header title="Quản lý Flashcards" />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng Decks</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{decks?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Decks công khai
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {decks?.filter((deck) => deck.isPublic).length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng Flashcards
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {decks?.reduce(
                  (total, deck) => total + (deck._count?.flashcards || 0),
                  0
                ) || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách Decks</CardTitle>
            <CardDescription>
              Quản lý tất cả decks flashcards trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="flex items-center space-x-2 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo tên deck hoặc người tạo..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Decks Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deck</TableHead>
                    <TableHead>Người tạo</TableHead>
                    <TableHead>Flashcards</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDecks?.map((deck) => (
                    <TableRow key={deck.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">
                            {deck.title}
                          </div>
                          {deck.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {deck.description}
                            </div>
                          )}
                          {deck.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {deck.tags.slice(0, 3).map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {deck.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{deck.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">
                            {deck.user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {deck.user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {deck._count?.flashcards || 0} thẻ
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={deck.isPublic ? "default" : "secondary"}
                        >
                          {deck.isPublic ? "Công khai" : "Riêng tư"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(deck.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link href={`/flashcards/${deck.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                              title="Xem chi tiết deck"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredDecks?.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Không tìm thấy deck nào</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
