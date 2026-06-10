const { PrismaClient } = require('../src/generated/client');
const prisma = new PrismaClient();

const MOCK_SKILLS = [
  {
    id: "skill_corner_maestro",
    name: "Corner Maestro",
    description: "Restores stamina smoothly on corners.",
    category: "Recovery",
    trigger: "Occurs randomly when passing a corner during the race.",
    iconUrl: "/skills/maestro.png"
  },
  {
    id: "skill_emperors_pride",
    name: "Emperor's Pride",
    description: "Slightly increases speed in the final stretch if overtaking 3 times or more.",
    category: "Speed",
    trigger: "Final stretch, position change >= 3 times, placement in top 40%.",
    iconUrl: "/skills/emperor.png"
  },
  {
    id: "skill_shadow_break",
    name: "Shadow Break",
    description: "Increases speed slightly in the final corner if in the front pack.",
    category: "Speed",
    trigger: "Final corner, placement <= 50%.",
    iconUrl: "/skills/shadow.png"
  },
  {
    id: "skill_arcana_mastery",
    name: "Arcana Mastery",
    description: "Greatly increases speed and acceleration at the last sprint.",
    category: "Speed",
    trigger: "Remaining distance <= 200m, motivation is Good or Perfect.",
    iconUrl: "/skills/arcana.png"
  },
  {
    id: "skill_straight_recovery",
    name: "Straight Recovery",
    description: "Restores stamina slightly on straight stretches.",
    category: "Recovery",
    trigger: "Occurs when on a straight section of the track.",
    iconUrl: "/skills/recovery.png"
  },
  {
    id: "skill_speed_ster",
    name: "Speedster",
    description: "Improves acceleration on corners during the last leg.",
    category: "Acceleration",
    trigger: "Corner in the last leg of the race.",
    iconUrl: "/skills/speedster.png"
  }
];

const MOCK_CHARACTERS = [
  {
    id: "char_special_week",
    name: "Special Week",
    rarity: 3,
    distanceType: "Medium, Long",
    runningStyle: "Leader, Betweener",
    growthBonus: "Stamina +20%, Wisdom +10%",
    uniqueSkillId: "skill_emperors_pride",
    skills: ["skill_corner_maestro", "skill_straight_recovery"],
    imageUrl: "/characters/special_week.png",
    events: JSON.stringify([
      {
        title: "A Golden Chance",
        choices: [
          { text: "Train harder", reward: "Speed +10, Energy -5" },
          { text: "Rest and recover", reward: "Energy +20, Motivation Up" }
        ]
      },
      {
        title: "Special Meeting",
        choices: [
          { text: "Ask for advice", reward: "Wisdom +15, Learn Hint: Corner Maestro" },
          { text: "Go for a run together", reward: "Stamina +15, Power +5" }
        ]
      }
    ])
  },
  {
    id: "char_silence_suzuka",
    name: "Silence Suzuka",
    rarity: 3,
    distanceType: "Mile, Medium",
    runningStyle: "Runner",
    growthBonus: "Speed +20%, Guts +10%",
    uniqueSkillId: "skill_speed_ster",
    skills: ["skill_speed_ster", "skill_arcana_mastery"],
    imageUrl: "/characters/silence_suzuka.png",
    events: JSON.stringify([
      {
        title: "Silent Run",
        choices: [
          { text: "Keep pacing behind", reward: "Stamina +10, Guts +5" },
          { text: "Sprint forward", reward: "Speed +15, Energy -10" }
        ]
      }
    ])
  },
  {
    id: "char_tokai_teio",
    name: "Tokai Teio",
    rarity: 3,
    distanceType: "Mile, Medium",
    runningStyle: "Leader",
    growthBonus: "Speed +20%, Power +10%",
    uniqueSkillId: "skill_shadow_break",
    skills: ["skill_speed_ster", "skill_corner_maestro"],
    imageUrl: "/characters/tokai_teio.png",
    events: JSON.stringify([
      {
        title: "Teio Step!",
        choices: [
          { text: "Practice the dance step", reward: "Power +15, Wisdom +5" },
          { text: "Focus on standard sprint", reward: "Speed +15, Stamina +5" }
        ]
      }
    ])
  },
  {
    id: "char_gold_ship",
    name: "Gold Ship",
    rarity: 2,
    distanceType: "Medium, Long",
    runningStyle: "Chaser",
    growthBonus: "Stamina +20%, Guts +10%",
    uniqueSkillId: "skill_arcana_mastery",
    skills: ["skill_straight_recovery", "skill_shadow_break"],
    imageUrl: "/characters/gold_ship.png",
    events: JSON.stringify([
      {
        title: "Ship Go Wild!",
        choices: [
          { text: "Join the chaos", reward: "Guts +20, Motivation Up, Energy -15" },
          { text: "Try to stop her", reward: "Wisdom +10, Energy +10" }
        ]
      }
    ])
  }
];

const MOCK_SUPPORT_CARDS = [
  {
    id: "card_kitasan_black",
    name: "Kitasan Black (SSR)",
    rarity: "SSR",
    type: "Speed",
    imageUrl: "/supports/kitasan.png",
    effects: JSON.stringify({
      friendshipBonus: "30%",
      trainingEffect: "15%",
      raceBonus: "10%",
      speedBonus: "+1",
      initialBond: "35"
    }),
    events: JSON.stringify([
      {
        title: "A Road to the Peak",
        choices: [
          { text: "Train for sprint", reward: "Speed +20" },
          { text: "Train for endurance", reward: "Stamina +15, Power +5" }
        ]
      }
    ]),
    skills: ["skill_speed_ster"]
  },
  {
    id: "card_fine_motion",
    name: "Fine Motion (SSR)",
    rarity: "SSR",
    type: "Wisdom",
    imageUrl: "/supports/fine_motion.png",
    effects: JSON.stringify({
      friendshipBonus: "25%",
      trainingEffect: "10%",
      wisdomBonus: "+1",
      initialBond: "30",
      hintLevel: "Lv 2"
    }),
    events: JSON.stringify([
      {
        title: "Tea Party With Elegance",
        choices: [
          { text: "Eat the cake politely", reward: "Wisdom +15, Energy +15" },
          { text: "Ask about her training regime", reward: "Learn Hint: Corner Maestro" }
        ]
      }
    ]),
    skills: ["skill_corner_maestro"]
  },
  {
    id: "card_super_creek",
    name: "Super Creek (SSR)",
    rarity: "SSR",
    type: "Stamina",
    imageUrl: "/supports/super_creek.png",
    effects: JSON.stringify({
      friendshipBonus: "35%",
      trainingEffect: "10%",
      staminaBonus: "+1",
      initialBond: "20"
    }),
    events: JSON.stringify([
      {
        title: "Nurturing Heart",
        choices: [
          { text: "Let her pamper you", reward: "Stamina +20, Energy +10" },
          { text: "Insist on running alone", reward: "Power +15, Motivation Up" }
        ]
      }
    ]),
    skills: ["skill_corner_maestro", "skill_straight_recovery"]
  },
  {
    id: "card_el_condor_pasa",
    name: "El Condor Pasa (SSR)",
    rarity: "SSR",
    type: "Power",
    imageUrl: "/supports/el_condor_pasa.png",
    effects: JSON.stringify({
      friendshipBonus: "25%",
      trainingEffect: "15%",
      powerBonus: "+1",
      initialBond: "25"
    }),
    events: JSON.stringify([
      {
        title: "Masked Passion",
        choices: [
          { text: "Train in the ring", reward: "Power +20" },
          { text: "Study Spanish tactics", reward: "Wisdom +15, Learn Hint: Shadow Break" }
        ]
      }
    ]),
    skills: ["skill_shadow_break"]
  }
];

const MOCK_RACES = [
  {
    id: "race_arima_kinen",
    name: "Arima Kinen",
    distance: 2500,
    track: "Turf",
    direction: "Clockwise",
    season: "Winter",
    weather: "Sunny",
    surface: "Good"
  },
  {
    id: "race_japan_cup",
    name: "Japan Cup",
    distance: 2400,
    track: "Turf",
    direction: "Counter-Clockwise",
    season: "Autumn",
    weather: "Cloudy",
    surface: "Good"
  },
  {
    id: "race_japanese_derby",
    name: "Tokyo Yushun (Japanese Derby)",
    distance: 2400,
    track: "Turf",
    direction: "Counter-Clockwise",
    season: "Spring",
    weather: "Sunny",
    surface: "Good"
  },
  {
    id: "race_satsuki_sho",
    name: "Satsuki Sho",
    distance: 2000,
    track: "Turf",
    direction: "Clockwise",
    season: "Spring",
    weather: "Sunny",
    surface: "Good"
  },
  {
    id: "race_tenno_sho_spring",
    name: "Tenno Sho (Spring)",
    distance: 3200,
    track: "Turf",
    direction: "Clockwise",
    season: "Spring",
    weather: "Cloudy",
    surface: "Soft"
  },
  {
    id: "race_takamatsunomiya_kinen",
    name: "Takamatsunomiya Kinen",
    distance: 1200,
    track: "Turf",
    direction: "Clockwise",
    season: "Spring",
    weather: "Rainy",
    surface: "Soft"
  },
  {
    id: "race_yasuda_kinen",
    name: "Yasuda Kinen",
    distance: 1600,
    track: "Turf",
    direction: "Counter-Clockwise",
    season: "Spring",
    weather: "Sunny",
    surface: "Good"
  }
];

async function seed() {
  console.log('Running database seed script...');

  // 1. Seed Skills
  for (const skill of MOCK_SKILLS) {
    await prisma.skill.upsert({
      where: { id: skill.id },
      update: skill,
      create: skill
    });
  }
  console.log('Seeded Skills:', MOCK_SKILLS.length);

  // 2. Seed Characters
  for (const char of MOCK_CHARACTERS) {
    const skillConnections = char.skills.map(id => ({ id }));
    await prisma.character.upsert({
      where: { id: char.id },
      update: {
        name: char.name,
        rarity: char.rarity,
        distanceType: char.distanceType,
        runningStyle: char.runningStyle,
        growthBonus: char.growthBonus,
        uniqueSkillId: char.uniqueSkillId,
        events: char.events,
        imageUrl: char.imageUrl,
        skills: {
          set: skillConnections
        }
      },
      create: {
        id: char.id,
        name: char.name,
        rarity: char.rarity,
        distanceType: char.distanceType,
        runningStyle: char.runningStyle,
        growthBonus: char.growthBonus,
        uniqueSkillId: char.uniqueSkillId,
        events: char.events,
        imageUrl: char.imageUrl,
        skills: {
          connect: skillConnections
        }
      }
    });
  }
  console.log('Seeded Characters:', MOCK_CHARACTERS.length);

  // 3. Seed Support Cards
  for (const card of MOCK_SUPPORT_CARDS) {
    const skillConnections = card.skills.map(id => ({ id }));
    await prisma.supportCard.upsert({
      where: { id: card.id },
      update: {
        name: card.name,
        rarity: card.rarity,
        type: card.type,
        effects: card.effects,
        events: card.events,
        imageUrl: card.imageUrl,
        skills: {
          set: skillConnections
        }
      },
      create: {
        id: card.id,
        name: card.name,
        rarity: card.rarity,
        type: card.type,
        effects: card.effects,
        events: card.events,
        imageUrl: card.imageUrl,
        skills: {
          connect: skillConnections
        }
      }
    });
  }
  console.log('Seeded Support Cards:', MOCK_SUPPORT_CARDS.length);

  // 4. Seed Races
  for (const race of MOCK_RACES) {
    await prisma.race.upsert({
      where: { id: race.id },
      update: race,
      create: race
    });
  }
  console.log('Seeded Races:', MOCK_RACES.length);

  // 5. Seed Users
  const admin = await prisma.user.upsert({
    where: { email: "admin@zenuma.com" },
    update: {},
    create: {
      name: "Admin Zen",
      email: "admin@zenuma.com",
      password: "adminpassword",
      role: "ADMIN",
      avatar: "/avatars/admin.png"
    }
  });

  const user = await prisma.user.upsert({
    where: { email: "user@zenuma.com" },
    update: {},
    create: {
      name: "Kafka Uma Trainer",
      email: "user@zenuma.com",
      password: "userpassword",
      role: "USER",
      avatar: "/avatars/user.png"
    }
  });
  console.log('Seeded Users: admin@zenuma.com / user@zenuma.com');

  // 6. Seed Builds
  await prisma.savedBuild.create({
    data: {
      userId: user.id,
      characterId: "char_special_week",
      title: "Arima Kinen Destroyer Build",
      distance: "Long",
      style: "Leader",
      targetSpeed: 1200,
      targetStam: 850,
      targetPower: 1000,
      targetGuts: 400,
      targetWisdom: 800,
      skills: JSON.stringify(["skill_corner_maestro", "skill_emperors_pride", "skill_straight_recovery"]),
      likes: 42,
      isPublic: true
    }
  });

  await prisma.savedBuild.create({
    data: {
      userId: user.id,
      characterId: "char_silence_suzuka",
      title: "Speed Demon Mile Build",
      distance: "Mile",
      style: "Runner",
      targetSpeed: 1500,
      targetStam: 600,
      targetPower: 1100,
      targetGuts: 500,
      targetWisdom: 900,
      skills: JSON.stringify(["skill_speed_ster", "skill_arcana_mastery"]),
      likes: 128,
      isPublic: true
    }
  });
  console.log('Seeded Builds: 2');

  // 7. Seed Sessions
  await prisma.trainingSession.create({
    data: {
      userId: user.id,
      characterId: "char_special_week",
      scenario: "URA Scenario",
      currentTurn: 72,
      motivation: "Perfect",
      energy: 80,
      speed: 1150,
      stamina: 820,
      power: 950,
      guts: 380,
      wisdom: 790,
      status: "COMPLETED"
    }
  });

  await prisma.trainingSession.create({
    data: {
      userId: user.id,
      characterId: "char_tokai_teio",
      scenario: "L'Arc Scenario",
      currentTurn: 72,
      motivation: "Good",
      energy: 60,
      speed: 1200,
      stamina: 700,
      power: 1000,
      guts: 450,
      wisdom: 850,
      status: "COMPLETED"
    }
  });

  await prisma.trainingSession.create({
    data: {
      userId: user.id,
      characterId: "char_gold_ship",
      scenario: "URA Scenario",
      currentTurn: 35,
      motivation: "Bad",
      energy: 45,
      speed: 550,
      stamina: 500,
      power: 480,
      guts: 310,
      wisdom: 290,
      status: "IN_PROGRESS"
    }
  });
  console.log('Seeded Sessions: 3');

  console.log('Database seeding finished successfully.');
}

seed()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
