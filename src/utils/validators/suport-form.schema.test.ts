import { describe, expect, it } from 'vitest';
import type { SafeParseReturnType } from 'zod';
import { draftLeadFormSchema, leadFormSchema } from './suport-form.schema';

const emptyRequiredFields = {
  source_campaign: '',
  communication_channel: '',
};

function errorPaths(result: SafeParseReturnType<unknown, unknown>) {
  return result.success
    ? []
    : result.error.issues.map((issue) => issue.path.join('.'));
}

describe('draftLeadFormSchema', () => {
  it('accepts a draft lead with empty source and channel', () => {
    const result = draftLeadFormSchema.safeParse({
      status: 'draft',
      ...emptyRequiredFields,
    });

    expect(result.success).toBe(true);
  });

  it('accepts a draft lead with source and channel missing', () => {
    expect(draftLeadFormSchema.safeParse({ status: 'draft' }).success).toBe(
      true
    );
  });

  it('still rejects malformed values', () => {
    const result = draftLeadFormSchema.safeParse({
      status: 'draft',
      cc: 'not-a-cc-option',
    });

    expect(errorPaths(result)).toEqual(['cc']);
  });
});

describe('leadFormSchema', () => {
  it('rejects a new lead with empty source and channel', () => {
    const result = leadFormSchema.safeParse({
      status: 'new',
      ...emptyRequiredFields,
    });

    expect(errorPaths(result)).toEqual([
      'source_campaign',
      'communication_channel',
    ]);
  });

  it('accepts a new lead with source and channel', () => {
    const result = leadFormSchema.safeParse({
      status: 'new',
      source_campaign: 'google',
      communication_channel: 'Call',
    });

    expect(result.success).toBe(true);
  });
});
