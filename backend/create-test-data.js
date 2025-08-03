const prisma = require('./config/prismaClient');

async function createTestData() {
  try {
    console.log('Creating test data...');

    // Get existing users
    const users = await prisma.user.findMany();
    console.log('Found users:', users.length);

    if (users.length === 0) {
      console.log('No users found. Please create users first.');
      return;
    }

    const user = users[0]; // Use first user

    // Create test notes
    const notes = await Promise.all([
      prisma.note.create({
        data: {
          title: 'Ghi chú học tập JavaScript',
          content: 'JavaScript là ngôn ngữ lập trình phổ biến...',
          priority: 'high',
          tags: ['javascript', 'programming', 'web'],
          userId: user.id,
        }
      }),
      prisma.note.create({
        data: {
          title: 'Ôn tập React Hooks',
          content: 'useState, useEffect, useContext...',
          priority: 'medium',
          tags: ['react', 'hooks', 'frontend'],
          userId: user.id,
        }
      }),
      prisma.note.create({
        data: {
          title: 'Database Design Principles',
          content: 'Normalization, indexing, relationships...',
          priority: 'urgent',
          tags: ['database', 'design', 'sql'],
          userId: user.id,
        }
      })
    ]);

    console.log('Created notes:', notes.length);

    // Create test AI logs
    const aiLogs = await Promise.all([
      prisma.aiLog.create({
        data: {
          userId: user.id,
          prompt: 'Explain React hooks to me',
          response: 'React hooks are functions that let you use state and other React features in functional components...'
        }
      }),
      prisma.aiLog.create({
        data: {
          userId: user.id,
          prompt: 'What is the difference between let and const in JavaScript?',
          response: 'let allows you to declare variables that can be reassigned, while const declares variables that cannot be reassigned...'
        }
      }),
      prisma.aiLog.create({
        data: {
          userId: user.id,
          prompt: 'How to optimize database queries?',
          response: 'Database query optimization involves several techniques: using indexes, avoiding N+1 queries, using proper joins...'
        }
      })
    ]);

    console.log('Created AI logs:', aiLogs.length);

    console.log('Test data created successfully!');
  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();
