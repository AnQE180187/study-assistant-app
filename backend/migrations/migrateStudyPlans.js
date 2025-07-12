const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateStudyPlans() {
  try {
    console.log('🔄 Bắt đầu migration StudyPlans...');
    
    // Lấy tất cả study plans cũ có field 'time'
    const oldPlans = await prisma.studyPlan.findMany({
      where: {
        time: {
          not: null
        }
      }
    });
    
    console.log(`📊 Tìm thấy ${oldPlans.length} study plans cần migration`);
    
    for (const plan of oldPlans) {
      try {
        // Chuyển đổi time cũ thành startTime và endTime
        const oldTime = plan.time;
        let startTime = '09:00';
        let endTime = '10:00';
        
        if (oldTime) {
          // Nếu time có format "HH:mm"
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
        
        // Cập nhật record với startTime và endTime mới
        await prisma.studyPlan.update({
          where: { id: plan.id },
          data: {
            startTime,
            endTime,
            time: null // Xóa field cũ
          }
        });
        
        console.log(`✅ Đã migration plan: ${plan.title} (${oldTime} -> ${startTime}-${endTime})`);
      } catch (error) {
        console.error(`❌ Lỗi migration plan ${plan.id}:`, error.message);
      }
    }
    
    console.log('🎉 Migration hoàn thành!');
  } catch (error) {
    console.error('❌ Lỗi migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy migration
migrateStudyPlans(); 