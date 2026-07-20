/* eslint-disable no-console */
// Seed dữ liệu demo khớp với src/mocks/ của frontend.
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CHAPTER_TITLES = [
  'Chapter 1: The Beginning',
  'Chapter 2: Unexpected Discovery',
  'Chapter 3: The Journey',
  'Chapter 4: Dark Paths',
  'Chapter 5: Resolution',
];

function chapterContent(storyTitle: string, chapterTitle: string): string {
  const paragraphs = [
    `${chapterTitle} — ${storyTitle}.`,
    'Bầu trời phía chân trời chuyển dần sang màu tím thẫm khi đoàn người cuối cùng rời khỏi cổng thành. Gió lạnh thổi qua những mái nhà cũ kỹ, mang theo mùi khói bếp và tiếng chuông xa vắng.',
    'Nhân vật chính dừng lại ở ngã ba đường, tay nắm chặt tấm bản đồ đã sờn mép. Mỗi quyết định lúc này đều có thể thay đổi tất cả những gì còn lại phía trước.',
    '"Chúng ta không còn nhiều thời gian," người bạn đồng hành thì thầm, ánh mắt hướng về khu rừng tối đen phía xa. "Nếu không đến nơi trước khi trăng lên, mọi công sức sẽ đổ sông đổ bể."',
    'Họ bước đi trong im lặng. Chỉ có tiếng lá khô vỡ vụn dưới chân và nhịp tim dồn dập của chính mình làm bạn đồng hành.',
    'Ở nơi sâu nhất của khu rừng, một ánh sáng kỳ lạ nhấp nháy — thứ ánh sáng không thuộc về thế giới này. Nó vừa mời gọi, vừa cảnh báo.',
    'Đêm đó, bên đống lửa nhỏ, những bí mật đầu tiên được hé lộ. Và như mọi bí mật khác, nó kéo theo nhiều câu hỏi hơn là câu trả lời.',
    'Khi bình minh ló dạng, con đường phía trước đã rõ ràng hơn — nhưng cái giá phải trả cũng vậy. Hành trình thực sự chỉ mới bắt đầu.',
  ];
  return paragraphs.join('\n\n');
}

async function main() {
  console.log('Bắt đầu seed...');

  // Xóa dữ liệu cũ (thứ tự tôn trọng khóa ngoại — SQLite cascade lo phần lớn)
  await prisma.report.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.chapterUnlock.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.readingProgress.deleteMany();
  await prisma.libraryEntry.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.otpCode.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.story.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('Password@123', 10);

  const admin = await prisma.user.create({
    data: {
      avatarUri: 'https://picsum.photos/seed/admin/150/150',
      coinBalance: 0,
      email: 'admin@novatales.app',
      emailVerified: true,
      handle: 'admin',
      name: 'NovaTales Admin',
      password,
      role: 'ADMIN',
    },
  });

  const reader = await prisma.user.create({
    data: {
      avatarUri: 'https://picsum.photos/seed/quangle/150/150',
      coinBalance: 200,
      email: 'reader@novatales.app',
      emailVerified: true,
      handle: 'quangle',
      name: 'Quang Le',
      password,
      role: 'READER',
    },
  });

  const john = await prisma.user.create({
    data: {
      avatarUri: 'https://picsum.photos/seed/auth1/100/100',
      email: 'john@novatales.app',
      emailVerified: true,
      handle: 'johndoe',
      name: 'John Doe',
      password,
      role: 'WRITER',
    },
  });
  const jane = await prisma.user.create({
    data: {
      avatarUri: 'https://picsum.photos/seed/auth2/100/100',
      email: 'jane@novatales.app',
      emailVerified: true,
      handle: 'janesmith',
      name: 'Jane Smith',
      password,
      role: 'WRITER',
    },
  });
  const alex = await prisma.user.create({
    data: {
      avatarUri: 'https://picsum.photos/seed/auth3/100/100',
      email: 'alex@novatales.app',
      emailVerified: true,
      handle: 'alexj',
      name: 'Alex Johnson',
      password,
      role: 'WRITER',
    },
  });

  const storySeeds = [
    {
      author: john,
      cover: 'story1',
      genres: ['Fantasy', 'Adventure'],
      rating: 4.5,
      ratingCount: 120,
      status: 'completed',
      title: 'Whispers of the Wind',
      views: 12_000,
    },
    {
      author: jane,
      cover: 'story2',
      genres: ['Mystery', 'Thriller'],
      rating: 4.2,
      ratingCount: 85,
      status: 'ongoing',
      title: 'Shadow in the Mirror',
      views: 8500,
    },
    {
      author: alex,
      cover: 'story3',
      genres: ['Sci-Fi', 'Steampunk'],
      rating: 4.8,
      ratingCount: 310,
      status: 'ongoing',
      title: 'The Clockwork City',
      views: 32_000,
    },
    {
      author: john,
      cover: 'story4',
      genres: ['Romance', 'Drama'],
      rating: 4,
      ratingCount: 64,
      status: 'completed',
      title: 'Beyond the Horizon',
      views: 5000,
    },
    {
      author: jane,
      cover: 'story5',
      genres: ['Fantasy', 'Magic'],
      rating: 4.7,
      ratingCount: 215,
      status: 'ongoing',
      title: 'Echoes of Eternity',
      views: 22_000,
    },
    {
      author: alex,
      cover: 'story6',
      genres: ['Adventure', 'Drama'],
      rating: 4.3,
      ratingCount: 92,
      status: 'completed',
      title: 'The Silent Forest',
      views: 9200,
    },
    {
      author: john,
      cover: 'featured',
      genres: ['Fantasy', 'Adventure', 'Action'],
      rating: 4.9,
      ratingCount: 1540,
      status: 'ongoing',
      title: 'NovaTales Chronicles',
      views: 150_000,
    },
  ];

  const stories = [] as { chapters: { id: string; index: number }[]; id: string; title: string }[];
  for (const seed of storySeeds) {
    const story = await prisma.story.create({
      data: {
        authorId: seed.author.id,
        coverUri: `https://picsum.photos/seed/${seed.cover}/300/450`,
        description: `"${seed.title}" — một câu chuyện ${seed.genres.join(', ').toLowerCase()} đầy cuốn hút của ${seed.author.name}.`,
        genres: JSON.stringify(seed.genres),
        moderation: 'APPROVED',
        ratingAvg: seed.rating,
        ratingCount: seed.ratingCount,
        ratingSum: Math.round(seed.rating * seed.ratingCount),
        status: seed.status,
        title: seed.title,
        viewCount: seed.views,
      },
    });
    const chapters: { id: string; index: number }[] = [];
    for (let index = 0; index < CHAPTER_TITLES.length; index += 1) {
      const title = CHAPTER_TITLES[index];
      // Chương cuối của truyện đang ra (ongoing) là chương VIP giá 20 xu
      const isVip = seed.status === 'ongoing' && index === CHAPTER_TITLES.length - 1;
      const chapter = await prisma.chapter.create({
        data: {
          coinPrice: isVip ? 20 : 0,
          content: chapterContent(seed.title, title),
          index: index + 1,
          isVip,
          publishedAt: new Date(Date.UTC(2026, 5, index + 1)),
          status: 'PUBLISHED',
          storyId: story.id,
          title,
        },
      });
      chapters.push({ id: chapter.id, index: chapter.index });
    }
    stories.push({ chapters, id: story.id, title: story.title });
  }

  // Thư viện của reader: đang đọc story1+2, đã lưu story3+4 (khớp mocks/library.ts)
  await prisma.libraryEntry.createMany({
    data: [
      { shelf: 'READING', storyId: stories[0].id, userId: reader.id },
      { shelf: 'READING', storyId: stories[1].id, userId: reader.id },
      { shelf: 'SAVED', storyId: stories[2].id, userId: reader.id },
      { shelf: 'SAVED', storyId: stories[3].id, userId: reader.id },
    ],
  });

  // Đọc dở: story2 ch2 40%, story3 ch4 75% (khớp mocks/stories.ts continueReading)
  await prisma.readingProgress.createMany({
    data: [
      {
        chapterId: stories[1].chapters[1].id,
        position: 0.4,
        storyId: stories[1].id,
        userId: reader.id,
      },
      {
        chapterId: stories[2].chapters[3].id,
        position: 0.75,
        storyId: stories[2].id,
        userId: reader.id,
      },
    ],
  });

  // Follow: reader theo dõi 2 tác giả
  await prisma.follow.createMany({
    data: [
      { followerId: reader.id, followingId: john.id },
      { followerId: reader.id, followingId: jane.id },
    ],
  });

  // Vài inline comment mẫu
  await prisma.comment.createMany({
    data: [
      {
        chapterId: stories[1].chapters[0].id,
        content: 'Mở đầu cuốn quá, đọc một mạch không dừng được!',
        paragraphIndex: 1,
        userId: reader.id,
      },
      {
        chapterId: stories[1].chapters[0].id,
        content: 'Đoạn này twist hay thật sự.',
        paragraphIndex: 3,
        userId: john.id,
      },
    ],
  });

  // Đánh giá mẫu của reader
  await prisma.rating.create({
    data: { stars: 5, storyId: stories[1].id, userId: reader.id },
  });

  // Giao dịch nạp xu ban đầu của reader
  await prisma.transaction.create({
    data: {
      amount: 200,
      description: 'Nạp 200 xu qua CARD (seed)',
      type: 'TOPUP',
      userId: reader.id,
    },
  });

  // Một truyện chờ kiểm duyệt để demo Admin
  await prisma.story.create({
    data: {
      authorId: jane.id,
      coverUri: 'https://picsum.photos/seed/pending1/300/450',
      description: 'Truyện mới gửi chờ admin duyệt.',
      genres: JSON.stringify(['Horror']),
      moderation: 'PENDING',
      title: 'The Hollow House',
    },
  });

  console.log('Seed xong!');
  console.log('Tài khoản demo (mật khẩu chung: Password@123):');
  console.log(`  ADMIN : admin@novatales.app`);
  console.log(`  READER: reader@novatales.app (200 xu)`);
  console.log(`  WRITER: john@novatales.app / jane@novatales.app / alex@novatales.app`);
  void admin;
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
