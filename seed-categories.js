const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Add some default categories
  const categories = [
    { name: 'electronics', description: 'Electronic devices and gadgets', icon: 'smartphone', color: '#3B82F6' },
    { name: 'clothing', description: 'Fashion and apparel', icon: 'shirt', color: '#EC4899' },
    { name: 'vehicles', description: 'Cars, motorcycles and other vehicles', icon: 'car', color: '#10B981' },
    { name: 'books', description: 'Books and educational materials', icon: 'book', color: '#F59E0B' },
    { name: 'gaming', description: 'Video games and consoles', icon: 'gamepad', color: '#8B5CF6' },
    { name: 'home', description: 'Home and garden items', icon: 'home', color: '#EF4444' },
    { name: 'sports', description: 'Sports and fitness equipment', icon: 'dumbbell', color: '#06B6D4' },
    { name: 'toys', description: 'Toys and games for children', icon: 'gift', color: '#F97316' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: category,
      create: category,
    });
  }

  console.log('Categories have been added successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
