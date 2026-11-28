import type { CaseRecord, EvidenceStatus } from './types.js';
import { isCalendarDate } from './format.js';

export interface EvidenceIssue { factId: string; message: string }

const nonnegativeMoney = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) >= 0;

/** Validate only the referenced source; unrelated attachments do not affect evidence readiness. */
export function sourceIssue(record: CaseRecord, sourceId: string | null, status: EvidenceStatus): string | undefined {
  const sources = record.sources.filter(source => source.id === sourceId);
  if (!sourceId?.trim() || sources.length !== 1) {
    return 'Choose one available, unambiguous supporting source from this application.';
  }
  const source = sources[0];
  if (!isCalendarDate(source.date) || !source.title.trim() || !source.excerpt.trim()
    || !['document', 'statement', 'worksheet'].includes(source.kind)) {
    return 'The supporting source needs a valid date, kind and readable details.';
  }
  if (status === 'document-supported' && source.kind === 'statement') {
    return 'Document-supported evidence requires a document or worksheet source.';
  }
  if (status === 'member-reported' && source.kind !== 'statement') {
    return 'Member-reported evidence requires a member statement source.';
  }
}

/** Evidence-input checks only: offer validation and financial calculations remain in assessment. */
export function validateEvidence(record: CaseRecord): EvidenceIssue[] {
  const issues: EvidenceIssue[] = [];
  const issue = (factId: string, message: string) => issues.push({ factId, message });
  if (!isCalendarDate(record.periodStart) || !isCalendarDate(record.periodEnd) || record.periodStart > record.periodEnd) {
    issue('period', 'Record a valid modeled start and end date, in calendar order.');
  }
  for (const category of ['opening', 'income', 'expense', 'obligation'] as const) {
    const facts = record.facts.filter(fact => fact.category === category);
    if (facts.length === 0 || (category === 'opening' && facts.length !== 1)) {
      issue(category, category === 'opening'
        ? 'Record exactly one opening spendable cash balance.'
        : `Record ${category} information explicitly, including a supported zero when applicable.`);
    }
  }
  const factIds = new Set<string>();
  for (const fact of record.facts) {
    if (!fact.id.trim() || factIds.has(fact.id)) issue(fact.id || 'facts', 'Each cash-flow fact needs a unique reference.');
    factIds.add(fact.id);
    if (!['opening', 'income', 'expense', 'obligation'].includes(fact.category)) {
      issue(fact.id, `${fact.label}: record a valid cash-flow category.`);
    }
    if (!['document-supported', 'member-reported'].includes(fact.status) || fact.value === null) {
      issue(fact.id, `${fact.label} needs a confirmed value and supporting source.`);
    } else if (!nonnegativeMoney(fact.value)) {
      issue(fact.id, `${fact.label}: record a nonnegative amount in whole centavos within the supported range.`);
    }
    if (!isCalendarDate(fact.effectiveDate)) issue(fact.id, `${fact.label}: record a valid effective date.`);
    if (!isCalendarDate(fact.cashDate) || fact.cashDate < record.periodStart || fact.cashDate > record.periodEnd) {
      issue(fact.id, `${fact.label}: record a valid cash date inside the modeled period.`);
    }
    if (fact.category === 'opening' && fact.cashDate !== record.periodStart) {
      issue(fact.id, 'Opening cash must describe the start of the modeled period.');
    }
    if (typeof fact.alreadyDeducted !== 'boolean' || (fact.alreadyDeducted && fact.category !== 'obligation')) {
      issue(fact.id, `${fact.label}: clarify whether this is an obligation already deducted from take-home pay.`);
    }
    const problem = sourceIssue(record, fact.sourceId, fact.status);
    if (problem) issue(fact.id, `${fact.label}: ${problem}`);
  }
  return issues;
}
