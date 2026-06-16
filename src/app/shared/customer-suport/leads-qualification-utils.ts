import {
  LEADS_QUALIFICATION_FIELDS,
  LeadsQualification,
  LeadsQualificationAnswer,
  LeadsQualificationFieldKey,
} from './leads-qualification-constants';

export function getAnswerForField(
  record: LeadsQualification | null | undefined,
  key: LeadsQualificationFieldKey
): LeadsQualificationAnswer {
  if (!record) return null;

  const flatAnswer = record[key];
  if (flatAnswer === 'yes' || flatAnswer === 'no') {
    return flatAnswer;
  }

  const questionAnswer = record.questions?.find((q) => q.key === key)?.answer;
  if (questionAnswer === 'yes' || questionAnswer === 'no') {
    return questionAnswer;
  }

  return null;
}

/** Flatten `questions[]` answers onto the record for consistent reads. */
export function normalizeQualificationRecord(
  record: LeadsQualification | null | undefined
): LeadsQualification | null {
  if (!record) return null;

  const normalized: LeadsQualification = { ...record };

  LEADS_QUALIFICATION_FIELDS.forEach((field) => {
    const answer = getAnswerForField(record, field.key);
    if (answer === 'yes' || answer === 'no') {
      normalized[field.key] = answer;
    }
  });

  return normalized;
}

export function isQualificationComplete(
  record: LeadsQualification | null | undefined
): boolean {
  if (!record) return false;

  return LEADS_QUALIFICATION_FIELDS.every((field) => {
    const answer = getAnswerForField(record, field.key);
    return answer === 'yes' || answer === 'no';
  });
}

export function countYesAnswers(record: LeadsQualification): number {
  return LEADS_QUALIFICATION_FIELDS.filter(
    (field) => getAnswerForField(record, field.key) === 'yes'
  ).length;
}

export function getInitialAnswers(
  record?: LeadsQualification | null
): Record<LeadsQualificationFieldKey, LeadsQualificationAnswer> {
  return LEADS_QUALIFICATION_FIELDS.reduce(
    (acc, field) => {
      acc[field.key] = getAnswerForField(record, field.key);
      return acc;
    },
    {} as Record<LeadsQualificationFieldKey, LeadsQualificationAnswer>
  );
}

export function extractQualificationRecord(
  response: { data?: LeadsQualification[] } | LeadsQualification | null | undefined
): LeadsQualification | null {
  if (!response) return null;

  let record: LeadsQualification | null = null;

  if ('data' in response && Array.isArray(response.data)) {
    record = response.data[0] ?? null;
  } else if ('id' in response) {
    record = response as LeadsQualification;
  }

  return normalizeQualificationRecord(record);
}
