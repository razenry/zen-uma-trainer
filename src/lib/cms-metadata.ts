export interface FieldDescriptor {
  key: string
  label: string
  type: 'text' | 'number' | 'select' | 'textarea' | 'boolean' | 'date' | 'datetime'
  options?: string[] | { value: string | number; label: string }[]
  required?: boolean
  defaultValue?: any
  isId?: boolean
  readonly?: boolean
}

export interface EntityMetadata {
  name: string
  pluralName: string
  modelName: string
  draftModelName?: string
  auditName: string
  searchFields: string[]
  fields: FieldDescriptor[]
}

const APTITUDE_OPTIONS = ['S', 'A', 'B', 'C', 'D', 'E', 'F', 'G']

export const ENTITY_METADATA: Record<string, EntityMetadata> = {
  characters: {
    name: 'Character',
    pluralName: 'Characters',
    modelName: 'character',
    draftModelName: 'characterDraft',
    auditName: 'Character',
    searchFields: ['name', 'japaneseName', 'alias'],
    fields: [
      { key: 'id', label: 'ID (Unique Slug)', type: 'text', required: true, isId: true, defaultValue: 'char_new' },
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'japaneseName', label: 'Japanese Name', type: 'text' },
      { key: 'alias', label: 'Alias', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'birthday', label: 'Birthday (MM-DD)', type: 'text' },
      { key: 'height', label: 'Height', type: 'text' },
      { key: 'weight', label: 'Weight', type: 'text' },
      { key: 'cv', label: 'Voice Actor (CV)', type: 'text' },
      { key: 'rarity', label: 'Rarity (1-3)', type: 'number', required: true, defaultValue: 3 },
      { key: 'growthSpeed', label: 'Growth Speed (%)', type: 'number', defaultValue: 0 },
      { key: 'growthStamina', label: 'Growth Stamina (%)', type: 'number', defaultValue: 0 },
      { key: 'growthPower', label: 'Growth Power (%)', type: 'number', defaultValue: 0 },
      { key: 'growthGuts', label: 'Growth Guts (%)', type: 'number', defaultValue: 0 },
      { key: 'growthWisdom', label: 'Growth Wisdom (%)', type: 'number', defaultValue: 0 },
      { key: 'sprint', label: 'Sprint Aptitude', type: 'select', options: APTITUDE_OPTIONS, defaultValue: 'A' },
      { key: 'mile', label: 'Mile Aptitude', type: 'select', options: APTITUDE_OPTIONS, defaultValue: 'A' },
      { key: 'medium', label: 'Medium Aptitude', type: 'select', options: APTITUDE_OPTIONS, defaultValue: 'A' },
      { key: 'long', label: 'Long Aptitude', type: 'select', options: APTITUDE_OPTIONS, defaultValue: 'A' },
      { key: 'front', label: 'Runner (Front) Style', type: 'select', options: APTITUDE_OPTIONS, defaultValue: 'A' },
      { key: 'leader', label: 'Leader Style', type: 'select', options: APTITUDE_OPTIONS, defaultValue: 'A' },
      { key: 'betweener', label: 'Betweener Style', type: 'select', options: APTITUDE_OPTIONS, defaultValue: 'A' },
      { key: 'chaser', label: 'Chaser Style', type: 'select', options: APTITUDE_OPTIONS, defaultValue: 'A' },
      { key: 'imageThumbnail', label: 'Thumbnail Image Path', type: 'text', defaultValue: '/characters/default-thumb.png' },
      { key: 'imageArtwork', label: 'Artwork Image Path', type: 'text' },
      { key: 'imageIcon', label: 'Icon Image Path', type: 'text' }
    ]
  },
  supports: {
    name: 'Support Card',
    pluralName: 'Support Cards',
    modelName: 'supportCard',
    draftModelName: 'supportCardDraft',
    auditName: 'SupportCard',
    searchFields: ['name'],
    fields: [
      { key: 'id', label: 'ID (Unique Slug)', type: 'text', required: true, isId: true, defaultValue: 'card_new' },
      { key: 'name', label: 'Card Name', type: 'text', required: true },
      { key: 'description', label: 'Card Description', type: 'textarea' },
      { key: 'rarity', label: 'Rarity', type: 'select', options: ['R', 'SR', 'SSR'], defaultValue: 'SSR' },
      { key: 'type', label: 'Card Type', type: 'select', options: ['Speed', 'Stamina', 'Power', 'Guts', 'Wisdom', 'Group', 'Friend'], defaultValue: 'Speed' },
      { key: 'trainingBonus', label: 'Training Bonus (%)', type: 'number', defaultValue: 0 },
      { key: 'friendshipBonus', label: 'Friendship Bonus (%)', type: 'number', defaultValue: 0 },
      { key: 'raceBonus', label: 'Race Bonus (%)', type: 'number', defaultValue: 0 },
      { key: 'fanBonus', label: 'Fan Bonus (%)', type: 'number', defaultValue: 0 },
      { key: 'hintLevelBonus', label: 'Hint Level Bonus', type: 'number', defaultValue: 0 },
      { key: 'initialBond', label: 'Initial Bond', type: 'number', defaultValue: 0 },
      { key: 'effects', label: 'Effects (JSON)', type: 'textarea', defaultValue: '{}' },
      { key: 'events', label: 'Events (JSON)', type: 'textarea', defaultValue: '[]' },
      { key: 'imageThumbnail', label: 'Thumbnail Image Path', type: 'text', defaultValue: '/supports/default-thumb.png' },
      { key: 'imageArtwork', label: 'Artwork Image Path', type: 'text' }
    ]
  },
  skills: {
    name: 'Skill',
    pluralName: 'Skills',
    modelName: 'skill',
    draftModelName: 'skillDraft',
    auditName: 'Skill',
    searchFields: ['name', 'description'],
    fields: [
      { key: 'id', label: 'ID (Unique Slug)', type: 'text', required: true, isId: true, defaultValue: 'skill_new' },
      { key: 'name', label: 'Skill Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea', required: true },
      { key: 'cost', label: 'Skill Cost', type: 'number', required: true, defaultValue: 120 },
      { key: 'tier', label: 'Tier', type: 'select', options: ['S', 'A', 'B', 'C', 'D'], defaultValue: 'B' },
      { key: 'category', label: 'Category', type: 'select', options: ['Speed', 'Stamina', 'Acceleration', 'Recovery', 'Passive', 'Debuff', 'Start'], defaultValue: 'Speed' },
      { key: 'trigger', label: 'Trigger Condition', type: 'text', defaultValue: 'Any' },
      { key: 'distanceRequirement', label: 'Distance Requirement', type: 'text', defaultValue: 'Any' },
      { key: 'styleRequirement', label: 'Style Requirement', type: 'text', defaultValue: 'Any' },
      { key: 'iconUrl', label: 'Icon URL', type: 'text', defaultValue: '/skills/default.png' }
    ]
  },
  races: {
    name: 'Race',
    pluralName: 'Races',
    modelName: 'race',
    draftModelName: 'raceDraft',
    auditName: 'Race',
    searchFields: ['name'],
    fields: [
      { key: 'id', label: 'ID (Unique Slug)', type: 'text', required: true, isId: true, defaultValue: 'race_new' },
      { key: 'name', label: 'Race Name', type: 'text', required: true },
      { key: 'distance', label: 'Distance (meters)', type: 'number', required: true, defaultValue: 1600 },
      { key: 'groundType', label: 'Ground Type', type: 'select', options: ['Turf', 'Dirt'], defaultValue: 'Turf' },
      { key: 'season', label: 'Season', type: 'select', options: ['Spring', 'Summer', 'Autumn', 'Winter'], defaultValue: 'Spring' },
      { key: 'grade', label: 'Grade', type: 'select', options: ['G1', 'G2', 'G3', 'Pre-OP', 'OP'], defaultValue: 'G1' },
      { key: 'fanRequirement', label: 'Fan Requirement', type: 'number', defaultValue: 0 },
      { key: 'direction', label: 'Direction', type: 'select', options: ['Clockwise', 'Counter-Clockwise'], defaultValue: 'Clockwise' },
      { key: 'weather', label: 'Weather', type: 'text', defaultValue: 'Sunny' },
      { key: 'surface', label: 'Surface Condition', type: 'text', defaultValue: 'Good' }
    ]
  },
  scenarios: {
    name: 'Scenario',
    pluralName: 'Scenarios',
    modelName: 'scenario',
    draftModelName: 'scenarioDraft',
    auditName: 'Scenario',
    searchFields: ['name', 'description'],
    fields: [
      { key: 'id', label: 'ID (Unique Slug)', type: 'text', required: true, isId: true, defaultValue: 'scenario_new' },
      { key: 'name', label: 'Scenario Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'releaseDate', label: 'Release Date', type: 'date' }
    ]
  },
  events: {
    name: 'Event',
    pluralName: 'Events',
    modelName: 'event',
    draftModelName: 'eventDraft',
    auditName: 'Event',
    searchFields: ['name', 'description'],
    fields: [
      { key: 'id', label: 'ID (Unique Slug)', type: 'text', required: true, isId: true, defaultValue: 'event_new' },
      { key: 'name', label: 'Event Name', type: 'text', required: true },
      { key: 'eventType', label: 'Event Type', type: 'select', required: true, options: ['CHAMPION_MEETING', 'LEAGUE_OF_HEROES', 'STORY_EVENT', 'TEAM_STADIUM', 'CAMPAIGN', 'LOGIN_BONUS', 'TRAINING_CAMPAIGN', 'GACHA_BANNER'], defaultValue: 'CHAMPION_MEETING' },
      { key: 'startDate', label: 'Start Date', type: 'datetime', required: true },
      { key: 'endDate', label: 'End Date', type: 'datetime', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'eventStatus', label: 'Event Status', type: 'select', options: ['UPCOMING', 'ACTIVE', 'ENDED'], defaultValue: 'UPCOMING' },
      { key: 'distance', label: 'Race Distance (m)', type: 'number' },
      { key: 'groundType', label: 'Ground Type', type: 'select', options: ['Turf', 'Dirt'] },
      { key: 'weather', label: 'Weather', type: 'text' },
      { key: 'trackCondition', label: 'Track Condition', type: 'select', options: ['Good', 'Slightly Heavy', 'Heavy', 'Soft'] },
      { key: 'direction', label: 'Direction', type: 'select', options: ['Clockwise', 'Counter-Clockwise', 'Right', 'Left'] },
      { key: 'location', label: 'Location / Track', type: 'text' },
      { key: 'season', label: 'Season', type: 'select', options: ['Spring', 'Summer', 'Autumn', 'Winter'] }
    ]
  },
  banners: {
    name: 'Banner',
    pluralName: 'Banners',
    modelName: 'banner',
    draftModelName: 'bannerDraft',
    auditName: 'Banner',
    searchFields: ['name', 'featuredContent'],
    fields: [
      { key: 'id', label: 'ID (Unique Slug)', type: 'text', required: true, isId: true, defaultValue: 'banner_new' },
      { key: 'name', label: 'Banner Name', type: 'text', required: true },
      { key: 'bannerType', label: 'Banner Type', type: 'select', required: true, options: ['CHARACTER', 'SUPPORT'], defaultValue: 'CHARACTER' },
      { key: 'startDate', label: 'Start Date', type: 'datetime', required: true },
      { key: 'endDate', label: 'End Date', type: 'datetime', required: true },
      { key: 'featuredContent', label: 'Featured Content', type: 'text' },
      { key: 'rateUpContent', label: 'Rate Up Content (JSON Array)', type: 'textarea', defaultValue: '[]' }
    ]
  },
  metabuilds: {
    name: 'Meta Build',
    pluralName: 'Meta Builds',
    modelName: 'savedBuild',
    auditName: 'SavedBuild',
    searchFields: ['title'],
    fields: [
      { key: 'id', label: 'ID (UUID)', type: 'text', readonly: true, isId: true },
      { key: 'title', label: 'Build Title', type: 'text', required: true },
      { key: 'characterId', label: 'Target Character ID', type: 'text', required: true },
      { key: 'distance', label: 'Distance Focus', type: 'select', options: ['Short', 'Mile', 'Medium', 'Long', 'Dirt'], defaultValue: 'Mile' },
      { key: 'style', label: 'Running Style', type: 'select', options: ['Runner', 'Leader', 'Betweener', 'Chaser'], defaultValue: 'Leader' },
      { key: 'targetSpeed', label: 'Target Speed', type: 'number', required: true, defaultValue: 1200 },
      { key: 'targetStam', label: 'Target Stamina', type: 'number', required: true, defaultValue: 600 },
      { key: 'targetPower', label: 'Target Power', type: 'number', required: true, defaultValue: 1000 },
      { key: 'targetGuts', label: 'Target Guts', type: 'number', required: true, defaultValue: 400 },
      { key: 'targetWisdom', label: 'Target Wisdom', type: 'number', required: true, defaultValue: 800 },
      { key: 'skills', label: 'Skills (JSON Array)', type: 'textarea', defaultValue: '[]' },
      { key: 'isPublic', label: 'Publicly Shared', type: 'boolean', defaultValue: true }
    ]
  },
  guides: {
    name: 'Community Guide',
    pluralName: 'Community Guides',
    modelName: 'communityGuide',
    auditName: 'CommunityGuide',
    searchFields: ['title', 'content'],
    fields: [
      { key: 'id', label: 'ID (UUID)', type: 'text', readonly: true, isId: true },
      { key: 'title', label: 'Guide Title', type: 'text', required: true },
      { key: 'content', label: 'Guide Content', type: 'textarea', required: true },
      { key: 'category', label: 'Category', type: 'select', options: ['Training', 'Build', 'Scenarios', 'Events', 'Gacha', 'Newbie'], defaultValue: 'Training' }
    ]
  },
  tags: {
    name: 'Tag',
    pluralName: 'Tags',
    modelName: 'tag',
    draftModelName: 'tagDraft',
    auditName: 'Tag',
    searchFields: ['name'],
    fields: [
      { key: 'id', label: 'Tag ID', type: 'text', required: true, isId: true, defaultValue: 'tag_new' },
      { key: 'name', label: 'Tag Name', type: 'text', required: true }
    ]
  },
  categories: {
    name: 'Category',
    pluralName: 'Categories',
    modelName: 'category',
    draftModelName: 'categoryDraft',
    auditName: 'Category',
    searchFields: ['name'],
    fields: [
      { key: 'id', label: 'Category ID', type: 'text', required: true, isId: true, defaultValue: 'cat_new' },
      { key: 'name', label: 'Category Name', type: 'text', required: true }
    ]
  }
}
