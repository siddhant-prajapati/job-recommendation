export function formatSalary(salary: number | null | undefined): string {
  if (salary == null) {
    return 'Salary not listed';
  }
  const lakhs = salary / 100_000;
  if (lakhs >= 1) {
    const value = Number.isInteger(lakhs) ? String(lakhs) : lakhs.toFixed(1).replace(/\.0$/, '');
    return `₹${value} LPA`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(salary);
}

export function formatEmploymentType(type: string): string {
  const labels: Record<string, string> = {
    FULL_TIME: 'Full Time',
    PART_TIME: 'Part Time',
    CONTRACT: 'Contract',
    INTERNSHIP: 'Internship',
  };
  return labels[type] ?? type.replaceAll('_', ' ');
}

export function formatExperience(years: number | null | undefined): string {
  if (years == null) {
    return 'Experience not listed';
  }
  if (years <= 0) {
    return 'Fresher friendly';
  }
  return `${years}+ year${years === 1 ? '' : 's'}`;
}

export function formatExperienceYears(years: number): string {
  if (years === 1) {
    return '1 year experience';
  }
  return `${years} years experience`;
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}
