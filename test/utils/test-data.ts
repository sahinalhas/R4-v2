export function createMockStudent(overrides = {}) {
  return {
    id: 1,
    student_number: 'STU001',
    first_name: 'Test',
    last_name: 'Student',
    class_level: '9',
    class_name: '9-A',
    gender: 'Male' as const,
    birth_date: '2008-01-01',
    parent_phone: '05551234567',
    parent_email: 'parent@test.com',
    address: 'Test Address',
    enrollment_date: '2023-09-01',
    status: 'active' as const,
    created_at: '2023-09-01T00:00:00.000Z',
    updated_at: '2023-09-01T00:00:00.000Z',
    ...overrides,
  };
}

export function createMockSurvey(overrides = {}) {
  return {
    id: 1,
    title: 'Test Survey',
    description: 'Test Description',
    category: 'Academic',
    status: 'active' as const,
    created_at: '2023-09-01T00:00:00.000Z',
    updated_at: '2023-09-01T00:00:00.000Z',
    ...overrides,
  };
}

export function createMockUser(overrides = {}) {
  return {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: 'Counselor' as const,
    created_at: '2023-09-01T00:00:00.000Z',
    ...overrides,
  };
}
