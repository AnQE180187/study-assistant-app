const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function simpleFix() {
  try {
    console.log('🔧 Bắt đầu simple fix...');
    
    // Bước 1: Tạo study plan mới với dữ liệu đúng
    console.log('📝 Tạo study plan test...');
    
    const testPlan = await prisma.studyPlan.create({
      data: {
        title: 'Test Plan',
        date: new Date(),
        startTime: '09:00',
        endTime: '10:00',
        note: 'Test note',
        userId: 'test-user-id'
      }
    });
    
    console.log('✅ Tạo test plan thành công:', testPlan.id);
    
    // Bước 2: Xóa test plan
    await prisma.studyPlan.delete({
      where: { id: testPlan.id }
    });
    
    console.log('✅ Xóa test plan thành công');
    console.log('🎉 Simple fix hoàn thành! Database schema đã sẵn sàng.');
    
  } catch (error) {
    console.error('❌ Lỗi simple fix:', error.message);
    
    if (error.message.includes('startTime')) {
      console.log('💡 Vấn đề: Database vẫn có dữ liệu cũ với startTime null');
      console.log('🔧 Giải pháp: Cần chạy migration hoặc xóa dữ liệu cũ');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy simple fix
simpleFix(); 