const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('Checking users in database...\n');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    });

    console.log('Total users:', users.length);
    console.log('\nUser details:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('');
    });

    // Check for admin users
    const adminUsers = users.filter(user => user.role === 'ADMIN' || user.role === 'SUPER_ADMIN');
    console.log(`\nAdmin users found: ${adminUsers.length}`);
    if (adminUsers.length === 0) {
      console.log('⚠️  No admin users found! You need to create an admin user.');
    } else {
      console.log('✅ Admin users:');
      adminUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.role})`);
      });
    }

  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
