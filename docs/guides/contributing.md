# Contributing Guide

Thank you for contributing to Rehber360! This guide will help you get started.

## 🎯 Ways to Contribute

- **Report bugs** via GitHub Issues
- **Suggest features** via GitHub Issues or Discussions
- **Submit pull requests** for bug fixes or features
- **Improve documentation**
- **Write tests** to increase coverage
- **Share feedback** on usability and design

---

## 🚀 Getting Started

### 1. Fork and Clone

```bash
# Fork repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/rehber360.git
cd rehber360

# Add upstream remote
git remote add upstream https://github.com/original-org/rehber360.git
```

### 2. Set Up Development Environment

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your settings
nano .env

# Start development server
npm run dev
```

See [Setup Guide](./setup.md) for detailed setup instructions.

### 3. Create a Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

**Branch naming conventions:**
- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `refactor/what-changed` - Code refactoring
- `docs/what-documented` - Documentation
- `test/what-tested` - Tests

---

## 💻 Development Workflow

### 1. Make Changes

```bash
# Make your changes
# Add tests for new features
# Run tests frequently
npm run test:watch
```

### 2. Code Quality Checks

Before committing, run:

```bash
# Type check, lint, format, test
npm run quality

# Or run individually:
npm run typecheck  # TypeScript type checking
npm run lint       # ESLint
npm run format     # Prettier
npm test           # Run tests
```

### 3. Commit Changes

Follow **Conventional Commits** format:

```bash
git add .
git commit -m "feat: add student bulk import"
git commit -m "fix: correct exam net calculation"
git commit -m "docs: update API documentation"
git commit -m "test: add counseling session tests"
git commit -m "refactor: migrate to feature-based structure"
```

**Commit types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `chore`: Build/tool changes

### 4. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create Pull Request on GitHub
# Fill out the PR template
```

---

## 📝 Pull Request Guidelines

### PR Title Format

```
feat: add student bulk import from Excel
fix: correct exam net score calculation
docs: update deployment guide
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement

## Related Issues
Closes #123
Fixes #456

## Testing
- [ ] All tests pass
- [ ] New tests added
- [ ] Manual testing completed

## Screenshots (if applicable)
[Add screenshots for UI changes]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Before Submitting PR

- [ ] Code passes all quality checks (`npm run quality`)
- [ ] All tests pass (`npm test`)
- [ ] New features have tests
- [ ] Documentation updated
- [ ] No linting errors
- [ ] Commit messages follow conventions
- [ ] Branch is up-to-date with main

---

## 🧪 Testing Requirements

### For Bug Fixes

- Add regression test to prevent bug from reoccurring
- Ensure all existing tests still pass

### For New Features

- Unit tests for utility functions
- Integration tests for API endpoints
- Component tests for UI components
- Minimum 80% code coverage for new code

### Test Examples

```typescript
// Unit test
describe('calculateNetScore', () => {
  it('calculates correct net score', () => {
    expect(calculateNetScore(10, 4)).toBe(9);
  });
});

// Integration test
describe('POST /api/students', () => {
  it('creates new student', async () => {
    const response = await request(app)
      .post('/api/students')
      .send({ name: 'Test', student_no: '2024-001' });
    expect(response.status).toBe(201);
  });
});

// Component test
describe('StudentCard', () => {
  it('renders student name', () => {
    render(<StudentCard student={mockStudent} />);
    expect(screen.getByText('Ali Yılmaz')).toBeInTheDocument();
  });
});
```

---

## 📖 Documentation Standards

### Code Documentation

```typescript
/**
 * Calculate net exam score.
 * Formula: correct - (wrong / 4)
 * 
 * @param correct - Number of correct answers
 * @param wrong - Number of wrong answers
 * @returns Net score (rounded to 2 decimals)
 * 
 * @example
 * calculateNetScore(10, 4) // Returns 9.00
 */
export function calculateNetScore(correct: number, wrong: number): number {
  return Math.round((correct - (wrong / 4)) * 100) / 100;
}
```

### API Documentation

When adding new endpoints, update:
- `docs/api/` - Endpoint documentation
- Request/response examples
- Error codes
- Authentication requirements

### Architecture Documentation

When making architectural changes, update:
- `docs/architecture/` - Architecture diagrams and explanations
- `docs/guides/` - Relevant guides

---

## 🎨 Code Style Guidelines

### TypeScript

```typescript
// ✅ GOOD: Explicit types for function parameters
function createStudent(data: CreateStudentRequest): Student {
  return { ...data, id: generateId() };
}

// ✅ GOOD: Type inference for local variables
const student = getStudent(1);

// ❌ BAD: Using 'any'
function processData(data: any) { ... }

// ✅ GOOD: Use 'unknown' if type is truly unknown
function parseJSON(input: string): unknown { ... }
```

### React Components

```tsx
// ✅ GOOD: Functional components with TypeScript
interface StudentCardProps {
  student: Student;
  onViewProfile: (id: number) => void;
}

export function StudentCard({ student, onViewProfile }: StudentCardProps) {
  return <Card>...</Card>;
}

// ✅ GOOD: Use hooks
const [isOpen, setIsOpen] = useState(false);
const students = useStudents();

// ❌ BAD: Class components (use functional components)
```

### Naming Conventions

- **Files**: `kebab-case.tsx` (`student-card.tsx`)
- **Components**: `PascalCase` (`StudentCard`)
- **Functions**: `camelCase` (`getStudents`)
- **Constants**: `UPPER_SNAKE_CASE` (`MAX_FILE_SIZE`)
- **Types/Interfaces**: `PascalCase` (`Student`, `CreateStudentRequest`)

### File Organization

Follow atomic design pattern:

```
client/components/
├── atoms/           # Basic UI elements
├── molecules/       # Simple combinations
├── organisms/       # Complex components
└── features/        # Feature-specific components
```

Backend follows feature-based structure:

```
server/features/<feature-name>/
├── routes/
├── services/
├── repository/
└── types/
```

---

## 🐛 Reporting Bugs

### Before Reporting

- Check existing issues
- Update to latest version
- Clear browser cache / restart server
- Check logs for error details

### Bug Report Template

```markdown
**Describe the bug**
Clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., Windows 10, macOS 14]
- Browser: [e.g., Chrome 120, Firefox 121]
- Node.js version: [e.g., 20.10.0]
- Rehber360 version: [e.g., 2.0.0]

**Logs**
Paste relevant error logs from console/server.

**Additional context**
Any other relevant information.
```

---

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Clear description of the problem.

**Describe the solution you'd like**
What you want to happen.

**Describe alternatives you've considered**
Other approaches you've thought about.

**Additional context**
Mockups, examples, etc.

**Use case**
Who would benefit from this feature and how?
```

---

## 🤝 Code of Conduct

### Our Standards

- **Be respectful** and constructive
- **Welcome newcomers** and help them learn
- **Give credit** where it's due
- **Accept feedback** gracefully
- **Focus on what's best** for the project

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Public or private harassment
- Publishing private information
- Unprofessional conduct

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

## 🙏 Thank You!

Your contributions make Rehber360 better for everyone. Whether you're fixing a typo, reporting a bug, or implementing a major feature, your help is appreciated!

---

**Questions?** Open a GitHub Discussion or reach out to the maintainers.

**Last Updated:** October 29, 2025
