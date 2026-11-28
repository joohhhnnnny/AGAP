import type { CaseRecord, DemoActor, FactCorrectionInput } from './types';
import { isCalendarDate } from './format';
import { sourceIssue, validateEvidence, type EvidenceIssue } from '../../packages/domain/src/evidence';
import { synchronizeReview } from './priorityReview';

export { validateEvidence, type EvidenceIssue };

export type CorrectionErrors = Partial<Record<keyof FactCorrectionInput | 'form', string>>;

export class EvidenceCorrectionError extends Error {
  readonly errors: CorrectionErrors;

  constructor(errors: CorrectionErrors) {
    super(Object.values(errors).join(' '));
    this.name = 'EvidenceCorrectionError';
    this.errors = errors;
  }
}

export function applyCorrection(record: CaseRecord, input: FactCorrectionInput, actor: DemoActor, at: string): CaseRecord {
  if (actor.role !== 'officer') throw new EvidenceCorrectionError({ form: 'Only a demo officer can correct evidence.' });
  const errors: CorrectionErrors = {};
  const facts = record.facts.filter(item => item.id === input.factId);
  const fact = facts.length === 1 ? facts[0] : undefined;

  if (!input.factId.trim() || !facts.length) errors.form = 'Choose an existing evidence fact.';
  else if (facts.length !== 1) errors.form = 'This fact reference is ambiguous. The correction was not saved; resolve the duplicate fact references first.';
  if (!input.reason.trim()) errors.reason = 'Enter a reason for this correction.';
  if (!isCalendarDate(input.effectiveDate)) errors.effectiveDate = 'Enter a valid effective date.';
  if (!['document-supported', 'member-reported', 'missing'].includes(input.status)) {
    errors.status = 'Choose an evidence status for the corrected fact.';
  }
  if (input.status === 'missing') {
    if (input.value !== null) errors.value = 'Missing evidence must have no amount; zero is a recorded value.';
    if (input.sourceId !== null) errors.sourceId = 'Missing evidence must have no source.';
  } else {
    if (input.value === null || !Number.isSafeInteger(input.value) || input.value < 0) {
      errors.value = 'Enter a nonnegative amount in whole centavos within the supported range.';
    }
    const problem = sourceIssue(record, input.sourceId, input.status);
    if (problem) errors.sourceId = problem;
  }
  if (Object.keys(errors).length || !fact) throw new EvidenceCorrectionError(errors);

  const next = structuredClone(record);
  const after = {
    ...structuredClone(fact), value: input.value, status: input.status,
    sourceId: input.sourceId, effectiveDate: input.effectiveDate,
  };
  next.version += 1;
  next.facts = next.facts.map(item => item.id === input.factId ? after : item);
  if (next.review) next.review.evidenceRevision = (next.review.evidenceRevision ?? 0) + 1;
  next.corrections.push({
    id: `${record.id}-correction-v${next.version}`, factId: input.factId,
    before: structuredClone(fact), after: structuredClone(after),
    reason: input.reason.trim(), actor: { ...actor }, at,
  });
  return synchronizeReview(next, at);
}

/** Parse decimal PHP without floating-point rounding or silently truncated cents. */
export function parsePesoInput(input: string): number {
  const text = input.trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(text)) {
    throw new EvidenceCorrectionError({ value: 'Enter an amount in PHP with at most two decimal places, without commas.' });
  }
  const [whole, fraction = ''] = text.split('.');
  const centavos = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
  if (centavos > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new EvidenceCorrectionError({ value: 'This amount is above the supported range.' });
  }
  return Number(centavos);
}
