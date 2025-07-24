const prisma = require('./config/prismaClient');

async function createTestFlashcards() {
  try {
    console.log('🎴 Creating test flashcards...');
    
    // Get first deck
    const deck = await prisma.deck.findFirst({
      include: {
        user: true,
        _count: {
          select: {
            flashcards: true,
          },
        },
      },
    });
    
    if (!deck) {
      console.log('❌ No decks found. Creating a test deck first...');
      
      // Get first user
      const user = await prisma.user.findFirst();
      if (!user) {
        console.log('❌ No users found. Please create a user first.');
        return;
      }
      
      // Create test deck
      const newDeck = await prisma.deck.create({
        data: {
          name: 'Test Admin Deck',
          description: 'A test deck for admin viewing',
          userId: user.id,
          isPublic: true,
        },
      });
      
      console.log('✅ Created test deck:', newDeck);
      
      // Create flashcards for this deck
      await createFlashcardsForDeck(newDeck.id);
      return;
    }
    
    console.log(`📋 Found deck: ${deck.name} (${deck._count.flashcards} flashcards)`);
    
    if (deck._count.flashcards === 0) {
      console.log('🎴 Deck has no flashcards. Creating test flashcards...');
      await createFlashcardsForDeck(deck.id);
    } else {
      console.log('✅ Deck already has flashcards');
    }
    
  } catch (error) {
    console.error('❌ Error creating test flashcards:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function createFlashcardsForDeck(deckId) {
  const testFlashcards = [
    {
      question: 'What is React Native?',
      answer: 'React Native is a framework for building mobile applications using React and JavaScript.',
      deckId,
    },
    {
      question: 'What is Node.js?',
      answer: 'Node.js is a JavaScript runtime built on Chrome\'s V8 JavaScript engine.',
      deckId,
    },
    {
      question: 'What is MongoDB?',
      answer: 'MongoDB is a document-oriented NoSQL database used for high volume data storage.',
      deckId,
    },
    {
      question: 'What is Express.js?',
      answer: 'Express.js is a minimal and flexible Node.js web application framework.',
      deckId,
    },
    {
      question: 'What is Prisma?',
      answer: 'Prisma is a next-generation ORM for Node.js and TypeScript.',
      deckId,
    },
  ];
  
  for (const flashcard of testFlashcards) {
    await prisma.flashcard.create({
      data: flashcard,
    });
  }
  
  console.log(`✅ Created ${testFlashcards.length} test flashcards`);
}

async function listDecksWithFlashcards() {
  try {
    console.log('\n📋 Listing all decks with flashcard counts...');
    
    const decks = await prisma.deck.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            flashcards: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    console.log(`\nFound ${decks.length} decks:`);
    decks.forEach((deck, index) => {
      console.log(`${index + 1}. ${deck.name} (${deck._count.flashcards} flashcards) - by ${deck.user.name}`);
      console.log(`   ID: ${deck.id}`);
    });
    
    return decks;
  } catch (error) {
    console.error('❌ Error listing decks:', error);
    return [];
  }
}

async function main() {
  console.log('🚀 Setting up test flashcards for admin testing...\n');
  
  await createTestFlashcards();
  await listDecksWithFlashcards();
  
  console.log('\n🎉 Test setup completed!');
  console.log('\n💡 You can now test admin flashcard viewing with the deck IDs above.');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createTestFlashcards, listDecksWithFlashcards };
