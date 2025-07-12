const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixStudyPlanSchema() {
  try {
    console.log('🔧 Bắt đầu fix StudyPlan schema...');
    
    // Bước 1: Kiểm tra xem có field 'time' không
    console.log('📋 Kiểm tra schema hiện tại...');
    
    // Bước 2: Backup dữ liệu cũ
    const oldPlans = await prisma.studyPlan.findMany();
    console.log(`📊 Tìm thấy ${oldPlans.length} study plans`);
    
    // Bước 3: Migration dữ liệu
    for (const plan of oldPlans) {
      try {
        let startTime = '09:00';
        let endTime = '10:00';
        
        // Nếu có field time cũ
        if (plan.time) {
          const oldTime = plan.time;
          if (oldTime.includes(':')) {
            const [hours, minutes] = oldTime.split(':');
            const startHour = parseInt(hours);
            const startMinute = parseInt(minutes);
            
            // Tạo endTime bằng cách cộng thêm 1 giờ
            const endHour = startHour + 1;
            const endMinute = startMinute;
            
            startTime = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
            endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
          }
        }
        
        // Cập nhật với startTime và endTime
        await prisma.studyPlan.update({
          where: { id: plan.id },
          data: {
            startTime,
            endTime
          }
        });
        
        console.log(`✅ Đã fix plan: ${plan.title}`);
      } catch (error) {
        console.error(`❌ Lỗi fix plan ${plan.id}:`, error.message);
      }
    }
    
    console.log('🎉 Fix schema hoàn thành!');
  } catch (error) {
    console.error('❌ Lỗi fix schema:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy fix
fixStudyPlanSchema(); 