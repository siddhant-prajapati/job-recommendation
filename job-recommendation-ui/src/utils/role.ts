import type { Skill } from '../types/skill';

export function inferRole(skills: Skill[]): string {
  const names = new Set(skills.map((skill) => skill.name.toLowerCase()));
  const has = (...needed: string[]) => needed.every((name) => names.has(name.toLowerCase()));

  if (has('java', 'spring boot')) {
    return 'Backend Developer';
  }
  if (has('react') || has('angular') || has('vue.js')) {
    return 'Frontend Engineer';
  }
  if (has('machine learning') || has('tensorflow')) {
    return 'ML Engineer';
  }
  if (has('python') && (has('spark') || has('airflow') || has('pandas'))) {
    return 'Data Engineer';
  }
  if (has('docker') && has('kubernetes')) {
    return 'DevOps Engineer';
  }
  if (has('node.js')) {
    return 'Full Stack Developer';
  }
  return 'Software Professional';
}
