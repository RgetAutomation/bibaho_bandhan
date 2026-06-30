const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { publicId: '21619180' },
        { phone: '21619180' },
      ]
    }
  });

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { type: 'PAID_USER' }
    });
    console.log('User updated successfully to PAID_USER');
  } else {
    console.log('User not found with publicId or phone 21619180');
  }
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
