import { COMMON_LABELS } from './common.labels';
import { NAVIGATION_LABELS } from './navigation.labels';
import { STUDENT_LABELS } from './student.labels';
import { ACADEMIC_LABELS } from './academic.labels';
import { STATUS_LABELS } from './status.labels';
import { TIME_LABELS } from './time.labels';

export { COMMON_LABELS, NAVIGATION_LABELS, STUDENT_LABELS, ACADEMIC_LABELS, STATUS_LABELS, TIME_LABELS };

export const UI_LABELS = {
  ...COMMON_LABELS,
  ...NAVIGATION_LABELS,
  ...STUDENT_LABELS,
  ...ACADEMIC_LABELS,
  ...STATUS_LABELS,
  ...TIME_LABELS,
} as const;

export type UILabel = keyof typeof UI_LABELS;
