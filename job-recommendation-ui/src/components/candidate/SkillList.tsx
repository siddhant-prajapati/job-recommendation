import type { Skill } from '../../types/skill';

type SkillListProps = {
  skills: Skill[] | string[];
  highlighted?: string[];
  emptyMessage?: string;
};

function skillName(skill: Skill | string): string {
  return typeof skill === 'string' ? skill : skill.name;
}

export function SkillList({
  skills,
  highlighted = [],
  emptyMessage = 'No related skills found',
}: SkillListProps) {
  const highlightSet = new Set(highlighted.map((name) => name.toLowerCase()));

  if (skills.length === 0) {
    return <p className="muted">{emptyMessage}</p>;
  }

  return (
    <ul className="skill-list">
      {skills.map((skill) => {
        const name = skillName(skill);
        const isMatch = highlightSet.has(name.toLowerCase());
        return (
          <li key={name} className={isMatch ? 'skill-tag skill-tag-match' : 'skill-tag'}>
            {name}
          </li>
        );
      })}
    </ul>
  );
}
