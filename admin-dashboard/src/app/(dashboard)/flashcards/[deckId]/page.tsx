'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFlashcards } from '@/lib/queries';
import { formatDate } from '@/lib/utils';
import { Search, ArrowLeft, BookOpen } from 'lucide-react';

export default function FlashcardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const deckId = params.deckId as string;
  const [search, setSearch] = useState('');

  const { data: flashcards, isLoading, error } = useFlashcards(deckId);

  const filteredFlashcards = flashcards?.filter(flashcard => 
    flashcard.term.toLowerCase().includes(search.toLowerCase()) ||
    flashcard.definition.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col">
        <Header title="Chi tiết Flashcards" />
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
        <Header title="Chi tiết Flashcards" />
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
      <Header title="Chi tiết Flashcards" />
      
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Back button and stats */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại</span>
          </Button>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <BookOpen className="h-4 w-4" />
              <span>{flashcards?.length || 0} flashcards</span>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách Flashcards</CardTitle>
            <CardDescription>
              Tất cả flashcards trong deck này
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="flex items-center space-x-2 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo thuật ngữ hoặc định nghĩa..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Flashcards Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">Thuật ngữ</TableHead>
                    <TableHead className="w-1/2">Định nghĩa</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFlashcards?.map((flashcard) => (
                    <TableRow key={flashcard.id}>
                      <TableCell>
                        <div className="font-medium text-gray-900">
                          {flashcard.term}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-gray-700 max-w-md">
                          {flashcard.definition.length > 200 
                            ? `${flashcard.definition.substring(0, 200)}...`
                            : flashcard.definition
                          }
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(flashcard.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredFlashcards?.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {search ? 'Không tìm thấy flashcard nào' : 'Deck này chưa có flashcard nào'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
