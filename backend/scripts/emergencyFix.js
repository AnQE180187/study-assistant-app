const { MongoClient } = require('mongodb');

async function emergencyFix() {
  const uri = process.env.DATABASE_URL;
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('🔗 Đã kết nối MongoDB');
    
    const db = client.db();
    const collection = db.collection('StudyPlan');
    
    // Tìm tất cả documents có time cũ
    const oldPlans = await collection.find({ time: { $exists: true } }).toArray();
    console.log(`📊 Tìm thấy ${oldPlans.length} plans cần fix`);
    
    for (const plan of oldPlans) {
      try {
        const oldTime = plan.time;
        let startTime = '09:00';
        let endTime = '10:00';
        
        if (oldTime && oldTime.includes(':')) {
          const [hours, minutes] = oldTime.split(':');
          const startHour = parseInt(hours);
          const startMinute = parseInt(minutes);
          
          // Tạo endTime bằng cách cộng thêm 1 giờ
          const endHour = startHour + 1;
          const endMinute = startMinute;
          
          startTime = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
          endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
        }
        
        // Cập nhật document
        await collection.updateOne(
          { _id: plan._id },
          { 
            $set: { 
              startTime, 
              endTime 
            },
            $unset: { time: "" }
          }
        );
        
        console.log(`✅ Đã fix plan: ${plan.title} (${oldTime} -> ${startTime}-${endTime})`);
      } catch (error) {
        console.error(`❌ Lỗi fix plan ${plan._id}:`, error.message);
      }
    }
    
    // Fix các documents có startTime null
    const nullPlans = await collection.find({ 
      $or: [
        { startTime: null },
        { startTime: { $exists: false } }
      ]
    }).toArray();
    
    console.log(`📊 Tìm thấy ${nullPlans.length} plans có startTime null`);
    
    for (const plan of nullPlans) {
      try {
        await collection.updateOne(
          { _id: plan._id },
          { 
            $set: { 
              startTime: '09:00', 
              endTime: '10:00' 
            }
          }
        );
        
        console.log(`✅ Đã fix plan null: ${plan.title}`);
      } catch (error) {
        console.error(`❌ Lỗi fix plan null ${plan._id}:`, error.message);
      }
    }
    
    console.log('🎉 Emergency fix hoàn thành!');
  } catch (error) {
    console.error('❌ Lỗi emergency fix:', error);
  } finally {
    await client.close();
  }
}

// Chạy emergency fix
emergencyFix(); 