import type { VercelRequest, VercelResponse } from '@vercel/node'
import * as cheerio from 'cheerio'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

/* ── Firebase Admin Init ─────────────────────────────── */
if (getApps().length === 0) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID || 'campus-hustlers',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  })
}
const db = getFirestore()

/* ── Types ───────────────────────────────────────────── */
interface ScrapedHackathon {
  title: string
  organizer: string
  description: string
  startDate: string
  endDate: string
  registrationDeadline: string
  mode: 'Online' | 'Offline' | 'Hybrid'
  category: string
  prize: string
  teamSize: string
  location: string
  website: string
  tags: string[]
  featured: boolean
  source: string
  image: string
}

/* ── Category Guesser ────────────────────────────────── */
function guessCategory(title: string, desc: string, tags: string[]): string {
  const text = `${title} ${desc} ${tags.join(' ')}`.toLowerCase()
  if (text.match(/\b(ai|ml|machine.?learning|deep.?learning|nlp|computer.?vision|genai|generative)\b/)) return 'AI / ML'
  if (text.match(/\b(web|frontend|backend|fullstack|full.?stack|react|node|javascript|html|css)\b/)) return 'Web Development'
  if (text.match(/\b(mobile|android|ios|flutter|react.?native|swift|kotlin)\b/)) return 'Mobile'
  if (text.match(/\b(blockchain|web3|crypto|ethereum|solidity|defi|nft|solana)\b/)) return 'Blockchain'
  if (text.match(/\b(iot|internet.?of.?things|arduino|raspberry|embedded|hardware|sensor)\b/)) return 'IoT'
  if (text.match(/\b(cyber|security|ctf|capture.?the.?flag|pentest|hacking|vulnerability)\b/)) return 'Cybersecurity'
  if (text.match(/\b(social|impact|ngo|sustainability|climate|health|education|community)\b/)) return 'Social Impact'
  return 'Open Innovation'
}

/* ── Strip HTML tags ─────────────────────────────────── */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

/* ── Mode Guesser ────────────────────────────────────── */
function guessMode(text: string): 'Online' | 'Offline' | 'Hybrid' {
  const lower = text.toLowerCase()
  if (lower.includes('hybrid')) return 'Hybrid'
  if (lower.includes('in-person') || lower.includes('in person') || lower.includes('offline') || lower.includes('on-site') || lower.includes('onsite')) return 'Offline'
  if (lower.includes('online') || lower.includes('virtual') || lower.includes('remote')) return 'Online'
  return 'Online'
}

/* ── India Filter ────────────────────────────────────── */
const INDIAN_CITIES = [
  'mumbai', 'delhi', 'bangalore', 'bengaluru', 'hyderabad', 'chennai',
  'kolkata', 'pune', 'ahmedabad', 'jaipur', 'lucknow', 'chandigarh',
  'indore', 'bhopal', 'kochi', 'coimbatore', 'thiruvananthapuram',
  'guwahati', 'noida', 'gurugram', 'gurgaon', 'greater noida',
  'new delhi', 'nagpur', 'visakhapatnam', 'patna', 'vadodara',
  'surat', 'kanpur', 'mysore', 'mysuru', 'mangalore', 'mangaluru',
  'bhubaneswar', 'dehradun', 'raipur', 'ranchi', 'goa', 'manipal',
  'vellore', 'warangal', 'tiruchirappalli', 'trichy', 'amritsar',
  'varanasi', 'allahabad', 'prayagraj', 'agra', 'meerut', 'faridabad',
  'rajkot', 'nashik', 'aurangabad', 'jodhpur', 'madurai', 'salem',
  'hubli', 'belgaum', 'belagavi', 'dharwad', 'shimla', 'jammu',
  'srinagar', 'gangtok', 'shillong', 'imphal', 'aizawl', 'kohima',
  'itanagar', 'agartala', 'panaji', 'silvassa', 'daman', 'pondicherry',
  'puducherry', 'kakinada', 'guntur', 'nellore', 'vijayawada',
]

function isIndian(hackathon: ScrapedHackathon): boolean {
  // Always include online hackathons
  if (hackathon.mode === 'Online') return true

  const loc = (hackathon.location || '').toLowerCase()
  // Direct India mention
  if (loc.includes('india')) return true
  // Check for known Indian cities
  return INDIAN_CITIES.some(city => loc.includes(city))
}

/* ── Normalize City ──────────────────────────────────── */
function normalizeCity(location: string): string {
  const loc = location.toLowerCase().trim()
  if (!loc || loc === 'online' || loc === 'virtual' || loc === 'remote' || loc === 'tbd') return 'Online'

  // Map common aliases
  const aliases: Record<string, string> = {
    'bengaluru': 'Bangalore', 'bangalore': 'Bangalore',
    'mumbai': 'Mumbai', 'bombay': 'Mumbai',
    'new delhi': 'Delhi', 'delhi': 'Delhi', 'noida': 'Delhi NCR',
    'gurugram': 'Delhi NCR', 'gurgaon': 'Delhi NCR', 'greater noida': 'Delhi NCR',
    'faridabad': 'Delhi NCR', 'ghaziabad': 'Delhi NCR',
    'hyderabad': 'Hyderabad', 'chennai': 'Chennai', 'madras': 'Chennai',
    'kolkata': 'Kolkata', 'calcutta': 'Kolkata',
    'pune': 'Pune', 'ahmedabad': 'Ahmedabad',
    'jaipur': 'Jaipur', 'lucknow': 'Lucknow',
    'chandigarh': 'Chandigarh', 'indore': 'Indore',
    'bhopal': 'Bhopal', 'kochi': 'Kochi', 'ernakulam': 'Kochi',
    'coimbatore': 'Coimbatore', 'goa': 'Goa', 'panaji': 'Goa',
    'mysore': 'Mysore', 'mysuru': 'Mysore', 'manipal': 'Manipal',
    'vellore': 'Vellore', 'guwahati': 'Guwahati',
    'thiruvananthapuram': 'Thiruvananthapuram',
    'bhubaneswar': 'Bhubaneswar', 'patna': 'Patna',
    'nagpur': 'Nagpur', 'surat': 'Surat', 'vadodara': 'Vadodara',
    'visakhapatnam': 'Visakhapatnam', 'vizag': 'Visakhapatnam',
    'dehradun': 'Dehradun', 'ranchi': 'Ranchi', 'raipur': 'Raipur',
    'vijayawada': 'Vijayawada',
  }

  for (const [key, city] of Object.entries(aliases)) {
    if (loc.includes(key)) return city
  }

  // If contains 'india', try to extract city before comma
  if (loc.includes('india')) {
    const parts = location.split(',')
    if (parts.length > 1) return parts[0].trim()
  }

  return location.trim()
}

/* ══════════════════════════════════════════════════════
   SCRAPERS
   ══════════════════════════════════════════════════════ */

/* ── Devpost Scraper ─────────────────────────────────── */
async function fetchDevpost(): Promise<ScrapedHackathon[]> {
  const hackathons: ScrapedHackathon[] = []
  try {
    // Devpost has an internal API used by their frontend
    const url = 'https://devpost.com/api/hackathons?status[]=upcoming&status[]=open&page=1&per_page=20'
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CampusHustlers/1.0)',
        'Accept': 'application/json',
      },
    })

    if (!res.ok) {
      console.log(`Devpost API returned ${res.status}, trying HTML scrape...`)
      return await fetchDevpostHTML()
    }

    const data = await res.json()
    if (data.hackathons && Array.isArray(data.hackathons)) {
      for (const h of data.hackathons) {
        hackathons.push({
          title: h.title || '',
          organizer: h.organization_name || 'Devpost',
          description: h.tagline || h.description || '',
          startDate: h.submission_period_dates?.split(' - ')[0] || '',
          endDate: h.submission_period_dates?.split(' - ')[1] || '',
          registrationDeadline: h.submission_period_dates?.split(' - ')[1] || '',
          mode: guessMode(h.location || h.title || ''),
          category: guessCategory(h.title || '', h.tagline || '', h.themes?.map((t: any) => t.name) || []),
          prize: h.prize_amount ? stripHtml(h.prize_amount) : 'Prizes available',
          teamSize: '1-5',
          location: h.location || 'Online',
          website: h.url || '',
          tags: h.themes?.map((t: any) => t.name).slice(0, 5) || [],
          featured: h.featured || false,
          source: 'devpost',
          image: h.thumbnail_url || '',
        })
      }
    }
  } catch (err) {
    console.error('Devpost scraping failed:', err)
  }
  return hackathons
}

/* ── Devpost HTML Fallback ───────────────────────────── */
async function fetchDevpostHTML(): Promise<ScrapedHackathon[]> {
  const hackathons: ScrapedHackathon[] = []
  try {
    const res = await fetch('https://devpost.com/hackathons?status[]=upcoming&status[]=open', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CampusHustlers/1.0)' },
    })
    if (!res.ok) return hackathons

    const html = await res.text()
    const $ = cheerio.load(html)

    $('.hackathon-tile').each((_, el) => {
      const $el = $(el)
      const title = $el.find('h3.mb-4, .hackathon-title').text().trim()
      const link = $el.find('a.tile-link, a').first().attr('href') || ''
      const tagline = $el.find('.tagline, .hackathon-tagline').text().trim()
      const location = $el.find('.info-with-icon .info span, .submission-period').text().trim()

      if (title && link) {
        hackathons.push({
          title,
          organizer: 'Devpost',
          description: tagline,
          startDate: '',
          endDate: '',
          registrationDeadline: '',
          mode: guessMode(location || title),
          category: guessCategory(title, tagline, []),
          prize: 'Prizes available',
          teamSize: '1-5',
          location: location || 'Online',
          website: link.startsWith('http') ? link : `https://devpost.com${link}`,
          tags: [],
          featured: false,
          source: 'devpost',
          image: '',
        })
      }
    })
  } catch (err) {
    console.error('Devpost HTML scraping failed:', err)
  }
  return hackathons
}

/* ── MLH Scraper ─────────────────────────────────────── */
async function fetchMLH(): Promise<ScrapedHackathon[]> {
  const hackathons: ScrapedHackathon[] = []
  const currentYear = new Date().getFullYear()
  const seasons = [currentYear, currentYear + 1]

  for (const season of seasons) {
    try {
      const res = await fetch(`https://mlh.io/seasons/${season}/events`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CampusHustlers/1.0)' },
      })
      if (!res.ok) continue

      const html = await res.text()
      const $ = cheerio.load(html)

      $('.event-wrapper .card').each((_, el) => {
        const $el = $(el)
        const title = $el.find('.event-name, h3').text().trim()
        const link = $el.find('a.event-link').attr('href') || $el.find('a').first().attr('href') || ''
        const date = $el.find('.event-date').text().trim()
        const location = $el.find('.event-location').text().trim()
        const image = $el.find('img').attr('src') || ''

        if (title) {
          hackathons.push({
            title,
            organizer: 'MLH',
            description: `MLH ${season} Season Hackathon`,
            startDate: date,
            endDate: '',
            registrationDeadline: '',
            mode: guessMode(location || ''),
            category: guessCategory(title, '', []),
            prize: 'MLH Prizes & Swag',
            teamSize: '1-4',
            location: location || 'TBD',
            website: link.startsWith('http') ? link : `https://mlh.io${link}`,
            tags: ['MLH', `${season} Season`],
            featured: true,
            source: 'mlh',
            image: image.startsWith('http') ? image : '',
          })
        }
      })
    } catch (err) {
      console.error(`MLH ${season} scraping failed:`, err)
    }
  }
  return hackathons
}

/* ── Devfolio API ────────────────────────────────────── */
async function fetchDevfolio(): Promise<ScrapedHackathon[]> {
  const hackathons: ScrapedHackathon[] = []
  try {
    // Step 1: Get total count
    const countRes = await fetch('https://api.devfolio.co/api/search/hackathons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; CampusHustlers/1.0)',
      },
      body: JSON.stringify({ from: 0, size: 1 }),
    })

    if (!countRes.ok) {
      console.log(`Devfolio API returned ${countRes.status}`)
      return hackathons
    }

    const countData = await countRes.json()
    const total = countData?.hits?.total?.value || countData?.hits?.total || 0
    console.log(`Devfolio total hackathons: ${total}`)

    if (total === 0) return hackathons

    // Step 2: Fetch the last 100 entries (newest hackathons are at the end)
    const startFrom = Math.max(0, total - 100)
    const res = await fetch('https://api.devfolio.co/api/search/hackathons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; CampusHustlers/1.0)',
      },
      body: JSON.stringify({ from: startFrom, size: 100 }),
    })

    if (!res.ok) {
      console.log(`Devfolio API (page 2) returned ${res.status}`)
      return hackathons
    }

    const data = await res.json()
    const hits = data?.hits?.hits || []
    const now = new Date()

    for (const hit of hits) {
      const h = hit._source || {}
      const name = h.name || ''
      const slug = h.slug || ''
      const tagline = h.tagline || h.desc || h.description || ''
      const starts = h.starts_at || ''
      const ends = h.ends_at || ''

      // Skip hackathons that have already ended
      if (ends) {
        try {
          const endDate = new Date(ends)
          if (endDate < now) continue
        } catch { /* keep if date can't be parsed */ }
      }

      // Extract reg_ends_at from nested hackathon_setting
      const settings = h.hackathon_setting || h['hackathon.hackathon_setting'] || {}
      const regEnds = (typeof settings === 'object' ? settings.reg_ends_at : '') || ''
      const regDeadline = regEnds || ends

      const isOnline = h.is_online === true
      const isHybrid = (typeof settings === 'object' && settings.is_hybrid === true) || h.is_hybrid === true
      const hackMode = isOnline ? 'Online' : (isHybrid ? 'Hybrid' : 'Offline')
      const loc = h.location || (isOnline ? 'Online' : 'India')

      // Build prize text
      let prizeText = 'Prizes available'
      const prizes = h.prizes
      if (Array.isArray(prizes) && prizes.length > 0) {
        prizeText = `${prizes.length} prize${prizes.length > 1 ? 's' : ''} available`
      }

      // Extract logo from settings
      const logo = (typeof settings === 'object' ? settings.logo : '') || h.logo || h.cover_img || ''

      // Convert ISO dates to YYYY-MM-DD
      const startDate = starts ? new Date(starts).toISOString().split('T')[0] : ''
      const endDate = ends ? new Date(ends).toISOString().split('T')[0] : ''
      const regEnd = regDeadline ? new Date(regDeadline).toISOString().split('T')[0] : ''

      if (name) {
        hackathons.push({
          title: name,
          organizer: 'Devfolio',
          description: tagline,
          startDate,
          endDate,
          registrationDeadline: regEnd,
          mode: hackMode,
          category: guessCategory(name, tagline, h.themes || []),
          prize: prizeText,
          teamSize: h.team_min && h.team_size ? `${h.team_min}-${h.team_size}` : '1-5',
          location: loc,
          website: `https://${slug}.devfolio.co`,
          tags: (Array.isArray(h.themes) ? h.themes : []).slice(0, 5),
          featured: h.featured || false,
          source: 'devfolio',
          image: logo,
        })
      }
    }
  } catch (err) {
    console.error('Devfolio API failed:', err)
  }
  return hackathons
}

/* ── Deduplicate ─────────────────────────────────────── */
function deduplicateHackathons(hackathons: ScrapedHackathon[]): ScrapedHackathon[] {
  const seen = new Map<string, ScrapedHackathon>()
  for (const h of hackathons) {
    const key = h.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 40)
    if (!seen.has(key)) {
      seen.set(key, h)
    }
  }
  return Array.from(seen.values())
}

/* ══════════════════════════════════════════════════════
   MAIN HANDLER
   ══════════════════════════════════════════════════════ */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Security: verify cron secret
  const authHeader = req.headers.authorization
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ success: false, error: 'Unauthorized' })
  }

  console.log('🔄 Starting hackathon fetch...')

  try {
    // Fetch from all sources in parallel
    const [devpostData, mlhData, devfolioData] = await Promise.allSettled([
      fetchDevpost(),
      fetchMLH(),
      fetchDevfolio(),
    ])

    const allHackathons: ScrapedHackathon[] = []

    if (devpostData.status === 'fulfilled') {
      console.log(`✅ Devpost: ${devpostData.value.length} hackathons`)
      allHackathons.push(...devpostData.value)
    } else {
      console.error('❌ Devpost failed:', devpostData.reason)
    }

    if (mlhData.status === 'fulfilled') {
      console.log(`✅ MLH: ${mlhData.value.length} hackathons`)
      allHackathons.push(...mlhData.value)
    } else {
      console.error('❌ MLH failed:', mlhData.reason)
    }

    if (devfolioData.status === 'fulfilled') {
      console.log(`✅ Devfolio: ${devfolioData.value.length} hackathons`)
      allHackathons.push(...devfolioData.value)
    } else {
      console.error('❌ Devfolio failed:', devfolioData.reason)
    }

    // Deduplicate
    const deduped = deduplicateHackathons(allHackathons)
    console.log(`📦 Total unique hackathons: ${deduped.length}`)

    // Filter to India-only (including Online)
    const unique = deduped.filter(isIndian)
    console.log(`🇮🇳 India-filtered hackathons: ${unique.length}`)

    // Normalize city names for location filter
    for (const h of unique) {
      h.location = normalizeCity(h.location)
    }

    if (unique.length === 0) {
      console.log('⚠️ No hackathons found from any source. Skipping Firestore update.')
      return res.json({
        success: true,
        message: 'No new hackathons found. Existing data preserved.',
        sources: { devpost: 0, mlh: 0, devfolio: 0 },
      })
    }

    // Save to Firestore — batch write
    const batch = db.batch()

    // Clear old scraped hackathons first
    const existingSnap = await db.collection('hackathons').where('source', '!=', 'manual').get()
    existingSnap.docs.forEach((doc) => batch.delete(doc.ref))

    // Write new ones
    for (const h of unique) {
      const ref = db.collection('hackathons').doc()
      batch.set(ref, {
        ...h,
        fetchedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
      })
    }

    // Update metadata
    const metaRef = db.collection('metadata').doc('hackathons')
    batch.set(metaRef, {
      lastFetchedAt: Timestamp.now(),
      totalCount: unique.length,
      sources: {
        devpost: devpostData.status === 'fulfilled' ? devpostData.value.length : 0,
        mlh: mlhData.status === 'fulfilled' ? mlhData.value.length : 0,
        devfolio: devfolioData.status === 'fulfilled' ? devfolioData.value.length : 0,
      },
    })

    await batch.commit()
    console.log(`✅ Saved ${unique.length} hackathons to Firestore`)

    return res.json({
      success: true,
      message: `Fetched and saved ${unique.length} hackathons`,
      totalCount: unique.length,
      sources: {
        devpost: devpostData.status === 'fulfilled' ? devpostData.value.length : 0,
        mlh: mlhData.status === 'fulfilled' ? mlhData.value.length : 0,
        devfolio: devfolioData.status === 'fulfilled' ? devfolioData.value.length : 0,
      },
    })
  } catch (error: any) {
    console.error('❌ Hackathon fetch failed:', error)
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    })
  }
}
