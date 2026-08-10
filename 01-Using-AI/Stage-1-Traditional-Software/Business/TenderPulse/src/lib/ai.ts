import type { Tender, Company } from './types'

export interface TenderWithScore extends Tender {
  score: number
  reasons: string[]
}

/**
 * Lightweight client-side recommendation engine.
 * Scores tenders 0-100 based on company profile, industry, location, budget fit, and status.
 */
export function recommendTenders(
  tenders: Tender[],
  company: Company | null,
  opts: { appliedTenderIds?: Set<string>; bookmarkedTenderIds?: Set<string> } = {}
): TenderWithScore[] {
  const applied = opts.appliedTenderIds ?? new Set<string>()
  const bookmarked = opts.bookmarkedTenderIds ?? new Set<string>()

  const scored = tenders
    .filter((t) => t.status === 'open')
    .map((t) => {
      let score = 30
      const reasons: string[] = []

      if (company) {
        if (company.industry && t.industry && company.industry.toLowerCase() === t.industry.toLowerCase()) {
          score += 35
          reasons.push(`Matches your industry (${company.industry})`)
        }
        if (company.state && t.state && company.state.toLowerCase() === t.state.toLowerCase()) {
          score += 15
          reasons.push(`Located in your state (${company.state})`)
        }
        if (company.annual_turnover != null && t.budget != null) {
          const turnoverBudgetRatio = company.annual_turnover / t.budget
          if (turnoverBudgetRatio >= 1 && turnoverBudgetRatio <= 10) {
            score += 12
            reasons.push('Budget fits your annual turnover')
          } else if (turnoverBudgetRatio >= 0.3) {
            score += 5
          }
        }
        if (company.business_type && company.business_type.toLowerCase().includes('contractor') && t.industry === 'Infrastructure') {
          score += 8
          reasons.push('Suited for contractors')
        }
        if (company.years_experience != null && company.years_experience >= 3) {
          score += 5
          reasons.push('You meet the experience threshold')
        }
      }

      if (applied.has(t.id)) {
        score -= 15
        reasons.push('Already applied')
      }
      if (bookmarked.has(t.id)) {
        score += 5
      }

      score = Math.max(0, Math.min(100, score))
      return { ...t, score, reasons }
    })

  return scored.sort((a, b) => b.score - a.score)
}

/**
 * Checks eligibility of a company against a tender's criteria.
 * Returns a checklist with pass/fail/unknown per criterion and an overall verdict.
 */
export interface EligibilityCheck {
  criteria: { label: string; passed: boolean | null; detail: string }[]
  passedCount: number
  total: number
  verdict: 'eligible' | 'partial' | 'unknown'
}

export function checkEligibility(tender: Tender, company: Company | null): EligibilityCheck {
  const items: EligibilityCheck['criteria'] = []

  const exprText = tender.eligibility_criteria ?? ''
  const text = exprText.toLowerCase()

  const turnoverMatch = text.match(/(?:turnover|turn over)[^.]*?(\d+)\s*(crore|cr|lakh|lac)/)
  if (turnoverMatch && company) {
    const val = parseInt(turnoverMatch[1])
    const unit = turnoverMatch[2]
    const required = unit.startsWith('cr') ? val * 10000000 : val * 100000
    const passed = company.annual_turnover != null ? company.annual_turnover >= required : null
    items.push({
      label: 'Annual turnover requirement',
      passed,
      detail: `Needs ≥ ${unit.startsWith('cr') ? `₹${val} Cr` : `₹${val} L`} annual turnover`,
    })
  }

  const expMatch = text.match(/(\d+)\s*year/) 
  if (expMatch && company) {
    const required = parseInt(expMatch[1])
    const passed = company.years_experience != null ? company.years_experience >= required : null
    items.push({
      label: 'Experience requirement',
      passed,
      detail: `Needs ≥ ${required} years of experience`,
    })
  }

  if (text.includes('gst') || text.includes('iso') || text.includes('cmmi') || text.includes('bis')) {
    const certsNeeded: string[] = []
    if (text.includes('gst')) certsNeeded.push('GST')
    if (text.includes('iso 9001')) certsNeeded.push('ISO 9001')
    if (text.includes('iso 13485')) certsNeeded.push('ISO 13485')
    if (text.includes('cmmi')) certsNeeded.push('CMMI')
    if (text.includes('bis')) certsNeeded.push('BIS')
    const have = company?.certifications ?? []
    const passed = certsNeeded.every((c) => have.some((h) => h.toLowerCase().includes(c.toLowerCase())))
    items.push({
      label: 'Certifications',
      passed: company ? passed : null,
      detail: `May require: ${certsNeeded.join(', ')}`,
    })
  }

  if (company && tender.state && company.state) {
    const sameState = company.state.toLowerCase() === tender.state.toLowerCase()
    items.push({
      label: 'Geographic match',
      passed: sameState ? true : null,
      detail: `Tender in ${tender.state}, your company in ${company.state}`,
    })
  }

  const total = items.length
  const passedCount = items.filter((i) => i.passed === true).length
  const failedCount = items.filter((i) => i.passed === false).length
  const verdict: EligibilityCheck['verdict'] =
    total === 0 ? 'unknown' : failedCount > 0 ? 'partial' : passedCount === total ? 'eligible' : 'partial'

  return { criteria: items, passedCount, total, verdict }
}

/**
 * Generates a short AI-style summary of a tender's description + key facts.
 */
export function summarizeTender(tender: Tender): string {
  const parts: string[] = []
  const desc = tender.description ?? ''
  const sentences = desc.split(/[.]+/).map((s) => s.trim()).filter(Boolean)
  const summary = sentences.slice(0, 2).join('. ')
  if (summary) parts.push(summary + '.')

  if (tender.budget) parts.push(`The estimated budget is ${formatBudgetWord(tender.budget)}.`)
  if (tender.organization) parts.push(`Issued by ${tender.organization}${tender.department ? `, ${tender.department}` : ''}.`)
  if (tender.closing_date) {
    const d = new Date(tender.closing_date)
    parts.push(`Bids close on ${d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}.`)
  }
  if (tender.eligibility_criteria) {
    const first = tender.eligibility_criteria.split(/[.]+/)[0]
    if (first) parts.push(`Key eligibility: ${first.trim()}.`)
  }
  return parts.join(' ')
}

function formatBudgetWord(b: number): string {
  if (b >= 10000000) return `₹${(b / 10000000).toFixed(2)} crore`
  if (b >= 100000) return `₹${(b / 100000).toFixed(2)} lakh`
  return `₹${b.toLocaleString('en-IN')}`
}

/**
 * Smart keyword suggestions based on a partial query.
 */
export function suggestKeywords(query: string, tenders: Tender[]): string[] {
  if (!query.trim()) {
    return ['Infrastructure', 'IT Services', 'Solar', 'Medical Equipment', 'Construction', 'Consultancy']
  }
  const q = query.toLowerCase()
  const fields = tenders.flatMap((t) => [
    t.title, t.industry, t.organization, t.state, t.ministry, t.category?.name,
  ].filter(Boolean) as string[])
  const matches = new Set<string>()
  for (const f of fields) {
    if (f.toLowerCase().includes(q)) matches.add(f)
  }
  return Array.from(matches).slice(0, 6)
}
