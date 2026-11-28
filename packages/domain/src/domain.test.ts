import { describe, expect, it } from 'vitest';
import { dateLabel, isCalendarDate, money, validateEvidence, type CaseRecord } from './index.js';

function sampleCase(): CaseRecord {
  return {
    id: 'domain-test-1',
    member: { name: 'Fictional Member', initials: 'FM', occupation: 'Clerk', memberSince: '2024-01-01' },
    purpose: 'Household support',
    createdAt: '2026-11-01T00:00:00Z',
    periodStart: '2026-11-01',
    periodEnd: '2026-11-30',
    version: 1,
    sources: [
      { id: 'doc-1', title: 'Payslip', kind: 'document', date: '2026-10-25', excerpt: 'Net pay 24,000' },
      { id: 'stmt-1', title: 'Member statement', kind: 'statement', date: '2026-10-28', excerpt: 'Expenses confirmed' },
    ],
    facts: [
      { id: 'open', label: 'Opening cash', category: 'opening', value: 100000, status: 'member-reported', sourceId: 'stmt-1', effectiveDate: '2026-11-01', cashDate: '2026-11-01', critical: true, alreadyDeducted: false },
      { id: 'inc', label: 'Take-home pay', category: 'income', value: 2400000, status: 'document-supported', sourceId: 'doc-1', effectiveDate: '2026-10-25', cashDate: '2026-11-15', critical: true, alreadyDeducted: false },
      { id: 'exp', label: 'Household expenses', category: 'expense', value: 1200000, status: 'member-reported', sourceId: 'stmt-1', effectiveDate: '2026-10-28', cashDate: '2026-11-10', critical: true, alreadyDeducted: false },
      { id: 'obl', label: 'Existing loan', category: 'obligation', value: 0, status: 'member-reported', sourceId: 'stmt-1', effectiveDate: '2026-10-28', cashDate: '2026-11-20', critical: false, alreadyDeducted: false },
    ],
    offers: [],
    corrections: [],
    recommendation: null,
    decisions: [],
    followUp: null,
  };
}

describe('packages/domain primitives', () => {
  it('formats integer centavos and rejects non-integer amounts', () => {
    expect(money(0)).toBe('₱0');
    expect(money(123450)).toBe('₱1,234.5');
    expect(money(-5000)).toBe('−₱50');
    expect(() => money(12.34)).toThrow(RangeError);
    expect(() => money(Number.MAX_SAFE_INTEGER + 1)).toThrow(RangeError);
  });

  it('validates real calendar dates and formats labels in UTC', () => {
    expect(isCalendarDate('2026-11-01')).toBe(true);
    expect(isCalendarDate('2028-02-29')).toBe(true);
    expect(isCalendarDate('2026-02-30')).toBe(false);
    expect(isCalendarDate('2026-11-31')).toBe(false);
    expect(dateLabel('2026-11-01')).toContain('2026');
  });

  it('validates complete evidence and detects missing or mismatched sources', () => {
    expect(validateEvidence(sampleCase())).toEqual([]);
    const broken = sampleCase();
    broken.facts[1].sourceId = 'stmt-1';
    broken.facts[2].value = null;
    const issues = validateEvidence(broken);
    expect(issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ factId: 'inc', message: expect.stringContaining('document or worksheet') }),
      expect.objectContaining({ factId: 'exp', message: expect.stringContaining('confirmed value') }),
    ]));
  });
});
