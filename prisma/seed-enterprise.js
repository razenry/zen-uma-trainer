const { PrismaClient } = require('../src/generated/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding enterprise database...');

  // 1. Seed Users with different Roles
  const admin = await prisma.user.upsert({
    where: { email: 'admin@zenuma.com' },
    update: {},
    create: {
      name: 'Razenry (Admin)',
      email: 'admin@zenuma.com',
      password: 'adminpassword',
      role: 'ADMIN',
      avatar: '/avatars/admin.png'
    }
  });

  const moderator = await prisma.user.upsert({
    where: { email: 'moderator@zenuma.com' },
    update: {},
    create: {
      name: 'Budi (Moderator)',
      email: 'moderator@zenuma.com',
      password: 'moderatorpassword',
      role: 'MODERATOR',
      avatar: '/avatars/moderator.png'
    }
  });

  const dataentry = await prisma.user.upsert({
    where: { email: 'dataentry@zenuma.com' },
    update: {},
    create: {
      name: 'Siska (Data Entry)',
      email: 'dataentry@zenuma.com',
      password: 'dataentrypassword',
      role: 'DATA_ENTRY',
      avatar: '/avatars/dataentry.png'
    }
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@zenuma.com' },
    update: {},
    create: {
      name: 'Kafka Trainer',
      email: 'user@zenuma.com',
      password: 'userpassword',
      role: 'USER',
      avatar: '/avatars/user.png'
    }
  });

  console.log('Seeded Users: Admin, Moderator, Data Entry, User.');

  // 2. Seed Skills
  const skill1 = {
    id: "skill_corner_maestro",
    name: "Corner Maestro",
    description: "Restores stamina smoothly on corners.",
    cost: 170,
    tier: "S",
    category: "Recovery",
    trigger: "Passing a corner",
    distanceRequirement: "Medium, Long",
    styleRequirement: "Any"
  };

  const skill2 = {
    id: "skill_emperors_pride",
    name: "Emperor's Pride",
    description: "Slightly increases speed in final stretch if overtaking 3+ times.",
    cost: 180,
    tier: "S",
    category: "Speed",
    trigger: "Final stretch, position change >= 3",
    distanceRequirement: "Any",
    styleRequirement: "Leader, Betweener"
  };

  const skill3 = {
    id: "skill_concentration",
    name: "Concentration",
    description: "Improves race start reaction time.",
    cost: 140,
    tier: "A",
    category: "Start",
    trigger: "Start of race",
    distanceRequirement: "Any",
    styleRequirement: "Any"
  };

  for (const s of [skill1, skill2, skill3]) {
    await prisma.skill.upsert({ where: { id: s.id }, update: s, create: s });
  }

  // 3. Seed Live Characters
  const char1 = {
    id: "char_special_week",
    name: "Special Week",
    japaneseName: "スペシャルウィーク",
    alias: "Spe-chan",
    description: "A bright and energetic horse girl who moved from Hokkaido.",
    birthday: "05-02",
    height: "158cm",
    weight: "Unknown",
    cv: "Azumi Waki",
    rarity: 3,
    growthSpeed: 0,
    growthStamina: 20,
    growthPower: 0,
    growthGuts: 0,
    growthWisdom: 10,
    sprint: "F",
    mile: "C",
    medium: "A",
    long: "A",
    front: "F",
    leader: "A",
    betweener: "A",
    chaser: "G",
    imageThumbnail: "/characters/special_week.png",
    uniqueSkillId: "skill_emperors_pride",
    events: JSON.stringify([
      {
        title: "Golden Chance",
        choices: [{ text: "Train Harder", reward: "Speed +10" }, { text: "Rest", reward: "Energy +20" }]
      }
    ])
  };

  const char2 = {
    id: "char_silence_suzuka",
    name: "Silence Suzuka",
    japaneseName: "サイレンススズカ",
    alias: "Silent Runner",
    description: "A quiet horse girl who loves running in the front.",
    birthday: "05-01",
    height: "156cm",
    weight: "Ideal",
    cv: "Marika Kono",
    rarity: 3,
    growthSpeed: 20,
    growthStamina: 0,
    growthPower: 0,
    growthGuts: 10,
    growthWisdom: 0,
    sprint: "G",
    mile: "A",
    medium: "A",
    long: "E",
    front: "S",
    leader: "C",
    betweener: "G",
    chaser: "G",
    imageThumbnail: "/characters/silence_suzuka.png",
    events: JSON.stringify([])
  };

  await prisma.character.upsert({
    where: { id: char1.id },
    update: char1,
    create: char1
  });
  await prisma.character.upsert({
    where: { id: char2.id },
    update: char2,
    create: char2
  });

  // Connect skills
  await prisma.character.update({
    where: { id: char1.id },
    data: { skills: { connect: [{ id: "skill_corner_maestro" }] } }
  });

  // 4. Seed Live Support Cards
  const card1 = {
    id: "card_kitasan_black",
    name: "Kitasan Black (SSR)",
    description: "Top tier speed support card.",
    rarity: "SSR",
    type: "Speed",
    trainingBonus: 15,
    friendshipBonus: 35,
    raceBonus: 10,
    fanBonus: 15,
    hintLevelBonus: 3,
    initialBond: 15,
    effects: JSON.stringify({ speedBonus: 1 }),
    events: JSON.stringify([]),
    imageThumbnail: "/supports/kitasan.png"
  };

  await prisma.supportCard.upsert({
    where: { id: card1.id },
    update: card1,
    create: card1
  });

  // 5. Seed Live Races
  const race1 = {
    id: "race_japan_cup",
    name: "Japan Cup",
    distance: 2400,
    groundType: "Turf",
    season: "Autumn",
    grade: "G1",
    fanRequirement: 25000,
    direction: "Counter-Clockwise",
    weather: "Sunny",
    surface: "Good"
  };

  await prisma.race.upsert({
    where: { id: race1.id },
    update: race1,
    create: race1
  });

  // 6. Seed Draft Tables to test Review Center Workflow
  // Character Draft - PENDING REVIEW
  await prisma.characterDraft.create({
    data: {
      status: "PENDING_REVIEW",
      contributorId: dataentry.id,
      name: "Oguri Cap",
      japaneseName: "オグリキャップ",
      alias: "Clay Idol",
      description: "Legendary horse girl from Kasamatsu.",
      birthday: "03-27",
      height: "167cm",
      weight: "Unknown",
      cv: "Yuko Sanpei",
      rarity: 3,
      growthSpeed: 20,
      growthPower: 10,
      sprint: "A",
      mile: "A",
      medium: "A",
      long: "B",
      front: "C",
      leader: "A",
      betweener: "S",
      chaser: "B",
      imageThumbnail: "/characters/oguri_cap.png"
    }
  });

  // Support Card Draft - DRAFT status
  await prisma.supportCardDraft.create({
    data: {
      status: "DRAFT",
      contributorId: dataentry.id,
      name: "Super Creek (SSR)",
      description: "Excellent stamina support card.",
      rarity: "SSR",
      type: "Stamina",
      trainingBonus: 10,
      friendshipBonus: 30,
      raceBonus: 5,
      fanBonus: 10,
      hintLevelBonus: 2,
      initialBond: 20,
      imageThumbnail: "/supports/super_creek.png"
    }
  });

  // Skill Draft - REJECTED status
  await prisma.skillDraft.create({
    data: {
      status: "REJECTED",
      reviewNotes: "Deskripsi trigger kurang detail. Mohon lengkapi.",
      contributorId: dataentry.id,
      name: "Arcana Mastery",
      description: "Greatly increases speed at final stretch.",
      cost: 170,
      tier: "A",
      category: "Speed",
      trigger: "Final stretch",
      distanceRequirement: "Any",
      styleRequirement: "Any"
    }
  });

  // Race Draft - APPROVED status
  await prisma.raceDraft.create({
    data: {
      status: "APPROVED",
      contributorId: dataentry.id,
      name: "Arima Kinen",
      distance: 2500,
      groundType: "Turf",
      season: "Winter",
      grade: "G1",
      fanRequirement: 25000,
      direction: "Clockwise"
    }
  });

  console.log('Seeded Drafts: Character (Pending), SupportCard (Draft), Skill (Rejected), Race (Approved).');

  // 7. Seed Saved Builds & Training Sessions
  await prisma.savedBuild.create({
    data: {
      userId: user.id,
      characterId: "char_special_week",
      title: "Oguri Cap Starter Mile Build",
      distance: "Mile",
      style: "Leader",
      targetSpeed: 1200,
      targetStam: 600,
      targetPower: 1000,
      targetGuts: 300,
      targetWisdom: 800,
      skills: JSON.stringify(["skill_corner_maestro"]),
      isPublic: true
    }
  });

  await prisma.trainingSession.create({
    data: {
      userId: user.id,
      characterId: "char_special_week",
      scenario: "URA Scenario",
      currentTurn: 35,
      motivation: "Normal",
      energy: 70,
      speed: 400,
      stamina: 300,
      power: 350,
      guts: 200,
      wisdom: 300
    }
  });

  // 8. Seed Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: dataentry.id,
      action: "CREATE",
      entity: "CharacterDraft",
      entityId: "draft_oguri_cap",
      before: null,
      after: JSON.stringify({ name: "Oguri Cap", rarity: 3 }),
      ipAddress: "127.0.0.1"
    }
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "PUBLISH",
      entity: "Character",
      entityId: "char_special_week",
      before: null,
      after: JSON.stringify({ name: "Special Week", rarity: 3 }),
      ipAddress: "192.168.1.1"
    }
  });

  // 9. Seed Community Guides
  await prisma.communityGuide.create({
    data: {
      userId: admin.id,
      title: "Panduan Dasar Pelatihan URA Scenario",
      content: "Panduan dasar untuk memaksimalkan status speed dan power pada skenario URA dengan deck support speed.",
      category: "Training",
      likes: 15,
      bookmarks: 8
    }
  });

  // 10. Seed Scenarios
  const scenario1 = {
    id: "scenario_ura",
    name: "URA Realistic Training",
    description: "The classic training scenario focusing on basic attributes.",
    releaseDate: "2021-02-24",
    status: "ACTIVE"
  };
  const scenario2 = {
    id: "scenario_aoharu",
    name: "Aoharu Cup",
    description: "Focuses on team training and team matches.",
    releaseDate: "2021-08-30",
    status: "ACTIVE"
  };
  const scenario3 = {
    id: "scenario_larc",
    name: "Project L'Arc",
    description: "An international scenario where you prepare for the Prix de l'Arc de Triomphe.",
    releaseDate: "2023-08-24",
    status: "ACTIVE"
  };
  const scenario4 = {
    id: "scenario_uaf",
    name: "U.A.F. Ready GO! Start",
    description: "An athletics-themed scenario focusing on trial matches across 15 sports categories.",
    releaseDate: "2024-02-24",
    status: "ACTIVE"
  };

  await prisma.scenario.upsert({ where: { id: scenario1.id }, update: scenario1, create: scenario1 });
  await prisma.scenario.upsert({ where: { id: scenario2.id }, update: scenario2, create: scenario2 });
  await prisma.scenario.upsert({ where: { id: scenario3.id }, update: scenario3, create: scenario3 });
  await prisma.scenario.upsert({ where: { id: scenario4.id }, update: scenario4, create: scenario4 });

  // 11. Seed Tags
  const tag1 = { id: "tag_speed_meta", name: "Speed Meta", status: "ACTIVE" };
  const tag2 = { id: "tag_long_distance", name: "Long Distance", status: "ACTIVE" };
  await prisma.tag.upsert({ where: { id: tag1.id }, update: tag1, create: tag1 });
  await prisma.tag.upsert({ where: { id: tag2.id }, update: tag2, create: tag2 });

  // 12. Seed Categories
  const cat1 = { id: "cat_runners", name: "Runner Guides", status: "ACTIVE" };
  const cat2 = { id: "cat_f2p", name: "F2P Friendly", status: "ACTIVE" };
  await prisma.category.upsert({ where: { id: cat1.id }, update: cat1, create: cat1 });
  await prisma.category.upsert({ where: { id: cat2.id }, update: cat2, create: cat2 });

  // 13. Seed Scenario, Tag, Category Drafts
  await prisma.scenarioDraft.create({
    data: {
      status: "PENDING_REVIEW",
      contributorId: dataentry.id,
      name: "Grand Live Scenario",
      description: "A music-themed scenario for scaling speed stats.",
      releaseDate: "2022-08-24"
    }
  });

  await prisma.tagDraft.create({
    data: {
      status: "DRAFT",
      contributorId: dataentry.id,
      name: "Guts Meta"
    }
  });

  await prisma.categoryDraft.create({
    data: {
      status: "DRAFT",
      contributorId: dataentry.id,
      name: "Chaser Builds"
    }
  });

  // 14. Seed Events (Champion Meetings, Campaigns, etc.)
  const now = new Date();
  
  // Ended Champion Meeting Aries (Ended 1 month ago)
  const dateAriesStart = new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000);
  const dateAriesEnd = new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000);
  
  // Active Champion Meeting Pisces (Active right now)
  const datePiscesStart = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const datePiscesEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  
  // Upcoming Champion Meeting Gemini (Starts in 15 days)
  const dateGeminiStart = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
  const dateGeminiEnd = new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000);

  const event1 = {
    id: "event_cm_pisces_2026",
    name: "Champion Meeting Pisces (March 2026)",
    eventType: "CHAMPION_MEETING",
    startDate: datePiscesStart,
    endDate: datePiscesEnd,
    description: "The spring long-distance showdown at Hanshin Turf.",
    eventStatus: "ACTIVE",
    status: "ACTIVE",
    distance: 3200,
    groundType: "Turf",
    weather: "Rainy",
    trackCondition: "Heavy",
    direction: "Clockwise",
    location: "Hanshin",
    season: "Spring"
  };

  const event2 = {
    id: "event_cm_aries_2026",
    name: "Champion Meeting Aries (April 2026)",
    eventType: "CHAMPION_MEETING",
    startDate: dateAriesStart,
    endDate: dateAriesEnd,
    description: "Medium-distance showdown on Nakayama Turf.",
    eventStatus: "ENDED",
    status: "ACTIVE",
    distance: 2000,
    groundType: "Turf",
    weather: "Sunny",
    trackCondition: "Good",
    direction: "Clockwise",
    location: "Nakayama",
    season: "Spring"
  };

  const event3 = {
    id: "event_cm_gemini_2026",
    name: "Champion Meeting Gemini (June 2026)",
    eventType: "CHAMPION_MEETING",
    startDate: dateGeminiStart,
    endDate: dateGeminiEnd,
    description: "Mile distance challenge at Tokyo Turf.",
    eventStatus: "UPCOMING",
    status: "ACTIVE",
    distance: 1600,
    groundType: "Turf",
    weather: "Sunny",
    trackCondition: "Good",
    direction: "Counter-Clockwise",
    location: "Tokyo",
    season: "Summer"
  };

  const event4 = {
    id: "event_loh_tokyo_2026",
    name: "League of Heroes (June 2026)",
    eventType: "LEAGUE_OF_HEROES",
    startDate: dateGeminiStart,
    endDate: dateGeminiEnd,
    description: "Classic medium-distance League of Heroes at Tokyo Racecourse.",
    eventStatus: "UPCOMING",
    status: "ACTIVE",
    distance: 2400,
    groundType: "Turf",
    weather: "Cloudy",
    trackCondition: "Good",
    direction: "Counter-Clockwise",
    location: "Tokyo",
    season: "Summer"
  };

  const event5 = {
    id: "event_campaign_uaf_release",
    name: "U.A.F Scenario Release Campaign",
    eventType: "CAMPAIGN",
    startDate: datePiscesStart,
    endDate: datePiscesEnd,
    description: "Celebrate the release of U.A.F. Scenario with training energy discounts and double rewards!",
    eventStatus: "ACTIVE",
    status: "ACTIVE"
  };

  for (const ev of [event1, event2, event3, event4, event5]) {
    await prisma.event.upsert({ where: { id: ev.id }, update: ev, create: ev });
  }

  // 15. Seed EventDrafts
  await prisma.eventDraft.create({
    data: {
      status: "PENDING_REVIEW",
      contributorId: dataentry.id,
      name: "Champion Meeting Cancer (July 2026)",
      eventType: "CHAMPION_MEETING",
      startDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 50 * 24 * 60 * 60 * 1000),
      description: "Dirt mile event at Ohi Racecourse.",
      distance: 1600,
      groundType: "Dirt",
      weather: "Sunny",
      trackCondition: "Good",
      direction: "Right",
      location: "Ohi",
      season: "Summer"
    }
  });

  // 16. Seed Banners (Gacha Banners)
  const banner1 = {
    id: "banner_spe_chan_rateup",
    name: "Special Week Pickup Gacha",
    bannerType: "CHARACTER",
    startDate: datePiscesStart,
    endDate: datePiscesEnd,
    featuredContent: "Special Week (3★)",
    rateUpContent: JSON.stringify(["char_special_week"]),
    status: "ACTIVE"
  };

  const banner2 = {
    id: "banner_kitasan_rateup",
    name: "Kitasan Black SSR Rate Up",
    bannerType: "SUPPORT",
    startDate: datePiscesStart,
    endDate: datePiscesEnd,
    featuredContent: "Kitasan Black SSR (Speed)",
    rateUpContent: JSON.stringify(["card_kitasan_black"]),
    status: "ACTIVE"
  };

  const banner3 = {
    id: "banner_suzuka_upcoming",
    name: "Silence Suzuka & Concentration Rate Up",
    bannerType: "CHARACTER",
    startDate: dateGeminiStart,
    endDate: dateGeminiEnd,
    featuredContent: "Silence Suzuka (3★)",
    rateUpContent: JSON.stringify(["char_silence_suzuka"]),
    status: "ACTIVE"
  };

  for (const b of [banner1, banner2, banner3]) {
    await prisma.banner.upsert({ where: { id: b.id }, update: b, create: b });
  }

  // 17. Seed BannerDrafts
  await prisma.bannerDraft.create({
    data: {
      status: "DRAFT",
      contributorId: dataentry.id,
      name: "Super Creek SSR Re-run Banner",
      bannerType: "SUPPORT",
      startDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
      featuredContent: "Super Creek SSR (Stamina)",
      rateUpContent: JSON.stringify(["card_super_creek_ssr"])
    }
  });

  // 18. Seed EventMetaBuilds (for Pisces 2026 Champion Meeting)
  const meta1 = {
    id: "meta_pisces_special_week",
    eventId: "event_cm_pisces_2026",
    characterId: "char_special_week",
    buildStats: JSON.stringify({
      speed: 1200,
      stamina: 1000,
      power: 1000,
      guts: 700,
      wisdom: 800
    }),
    skillPriority: JSON.stringify([
      { name: "Corner Maestro", priority: "S (Core Recovery)" },
      { name: "Emperor's Pride", priority: "S (Core Speed)" },
      { name: "Concentration", priority: "A (Start Reaction)" }
    ]),
    supportDeck: JSON.stringify([
      { id: "card_kitasan_black", role: "Speed / Trailing" },
      { id: "card_super_creek_ssr", role: "Stamina / Corner Maestro" }
    ]),
    rating: "S",
    status: "ACTIVE"
  };

  await prisma.eventMetaBuild.upsert({
    where: { id: meta1.id },
    update: meta1,
    create: meta1
  });

  // 19. Seed EventSubscriptions
  await prisma.eventSubscription.create({
    data: {
      userId: user.id,
      subscriptionType: "CHAMPION_MEETING",
      eventId: "event_cm_pisces_2026",
      remindBefore: 3
    }
  });

  await prisma.eventSubscription.create({
    data: {
      userId: user.id,
      subscriptionType: "BANNER",
      eventId: "banner_suzuka_upcoming",
      remindBefore: 1
    }
  });

  console.log('Enterprise Database Seeding completed successfully.');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
