import { ConnectionOptions } from 'typeorm'

const env = process.env

export const dbConfig = {
  database: 'postgres',
  host: env.DB_HOST || '0.0.0.0',
  log: {
    query: env.DB_LOG_QUERIES || true
  },
  password: env.DB_PASSWORD || 'mysecretpw',
  port: env.DB_PORT || 5432,
  synchronize: env.DB_SYNCHRONIZE || true,
  type: 'postgres',
  username: env.DB_USERNAME || 'postgres'
} as ConnectionOptions

export const entityRelationships = {
  mediaRef: {
    mustHavePodcast: env.MEDIA_REF_HAS_PODCAST || false,
    mustHaveUser: env.MEDIA_REF_HAS_USER || false
  }
}

export const validCategories = [
  {
    title: 'Arts',
    categories: [
      { title: 'Design' },
      { title: 'Fashion & Beauty' },
      { title: 'Food' },
      { title: 'Literature' },
      { title: 'Performing Arts' },
      { title: 'Visual Arts' }
    ]
  },
  {
    title: 'Business',
    categories: [
      { title: 'Business News' },
      { title: 'Careers' },
      { title: 'Investing' },
      { title: 'Management & Marketing' },
      { title: 'Shopping' }
    ]
  },
  {
    title: 'Comedy',
    categories: []
  },
  {
    title: 'Education',
    categories: [
      { title: 'Higher Education' },
      { title: 'K-12' },
      { title: 'Language Courses' },
      { title: 'Training' }
    ]
  },
  {
    title: 'Games & Hobbies',
    categories: [
      { title: 'Automotive' },
      { title: 'Aviation' },
      { title: 'Hobbies' },
      { title: 'Other Games' },
      { title: 'Video Games' }
    ]
  },
  {
    title: 'Government & Organizations',
    categories: [
      { title: 'Local' },
      { title: 'National' },
      { title: 'Non-Profit' },
      { title: 'Regional' }
    ]
  },
  {
    title: 'Health',
    categories: [
      { title: 'Alternative Health' },
      { title: 'Fitness & Nutrition' },
      { title: 'Kids & Family' },
      { title: 'Self-Help' },
      { title: 'Sexuality' }
    ]
  },
  {
    title: 'Music',
    categories: []
  },
  {
    title: 'News & Politics',
    categories: [
      { title: 'Religion & Spirituality' },
      { title: 'Buddhism' },
      { title: 'Christianity' },
      { title: 'Hinduism' },
      { title: 'Islam' },
      { title: 'Judaism' },
      { title: 'Other' },
      { title: 'Spirituality' }
    ]
  },
  {
    title: 'Science & Medicine',
    categories: [
      { title: 'Medicine' },
      { title: 'Natural Sciences' },
      { title: 'Social Sciences' }
    ]
  },
  {
    title: 'Society & Culture',
    categories: [
      { title: 'History' },
      { title: 'Personal Journals' },
      { title: 'Philosophy' },
      { title: 'Places & Travel' }
    ]
  },
  {
    title: 'Sports & Recreation',
    categories: [
      { title: 'Amateur' },
      { title: 'College & High School' },
      { title: 'Outdoor' },
      { title: 'Professional' },
      { title: 'TV & Film' }
    ]
  },
  {
    title: 'Technology',
    categories: [
      { title: 'Gadgets' },
      { title: 'Podcasting' },
      { title: 'Software How-To' },
      { title: 'Tech News' }
    ]
  }
]

let categoryTitles = []
for (const category of validCategories) {
  categoryTitles.push(category.title)
  for (const subCategory of category.categories) {
    categoryTitles.push(subCategory.title)
  }
}

export const validCategoryTitles = categoryTitles
