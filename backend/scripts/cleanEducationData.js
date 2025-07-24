const prisma = require('../config/prismaClient');

async function cleanEducationData() {
  try {
    console.log('Starting education data cleanup...');
    
    // First, let's see what education values exist in the database
    const allUsers = await prisma.$runCommandRaw({
      find: 'User',
      filter: {},
      projection: { education: 1, name: 1, email: 1 }
    });
    
    console.log('Total users in database:', allUsers.cursor.firstBatch.length);
    
    // Count education values
    const educationCounts = {};
    const invalidEducationUsers = [];
    
    allUsers.cursor.firstBatch.forEach(user => {
      if (user.education) {
        educationCounts[user.education] = (educationCounts[user.education] || 0) + 1;
        
        // Check if education value is valid
        const validEducationLevels = ['ELEMENTARY', 'MIDDLE_SCHOOL', 'HIGH_SCHOOL', 'UNIVERSITY', 'GRADUATE', 'OTHER'];
        if (!validEducationLevels.includes(user.education)) {
          invalidEducationUsers.push(user);
        }
      }
    });
    
    console.log('Current education distribution:', educationCounts);
    console.log('Invalid education users:', invalidEducationUsers.length);
    
    if (invalidEducationUsers.length > 0) {
      console.log('Users with invalid education values:');
      invalidEducationUsers.forEach(user => {
        console.log(`- ${user.name || 'No name'} (${user.email}): education = "${user.education}"`);
      });
      
      // Clean up invalid education values by setting them to null
      const cleanupResult = await prisma.$runCommandRaw({
        update: 'User',
        updates: [
          {
            q: { 
              education: { 
                $nin: ['ELEMENTARY', 'MIDDLE_SCHOOL', 'HIGH_SCHOOL', 'UNIVERSITY', 'GRADUATE', 'OTHER'] 
              } 
            },
            u: { $unset: { education: "" } },
            multi: true
          }
        ]
      });
      
      console.log('Cleanup result:', cleanupResult.nModified || 0, 'users updated');
    }
    
    // Show final education distribution
    const finalUsers = await prisma.$runCommandRaw({
      find: 'User',
      filter: {},
      projection: { education: 1 }
    });
    
    const finalEducationCounts = {};
    finalUsers.cursor.firstBatch.forEach(user => {
      if (user.education) {
        finalEducationCounts[user.education] = (finalEducationCounts[user.education] || 0) + 1;
      } else {
        finalEducationCounts['null'] = (finalEducationCounts['null'] || 0) + 1;
      }
    });
    
    console.log('\nFinal education distribution:', finalEducationCounts);
    console.log('\nEducation data cleanup completed successfully!');
    
  } catch (error) {
    console.error('Error during education cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanEducationData();
