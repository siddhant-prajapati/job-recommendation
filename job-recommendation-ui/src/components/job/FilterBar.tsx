import type { ChangeEvent } from 'react';
import type { JobFilters, SortOption } from '../../types/recommendation';
import { SearchIcon } from '../common/Icons';

type FilterBarProps = {
  filters: JobFilters;
  locations: string[];
  onChange: (next: JobFilters) => void;
  showMatchFilter?: boolean;
  showMatchSort?: boolean;
};

const EMPLOYMENT_OPTIONS = ['All', 'FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'];

const MATCH_OPTIONS: Array<{ label: string; value: number | null }> = [
  { label: 'All', value: null },
  { label: '90%+', value: 90 },
  { label: '80%+', value: 80 },
  { label: '70%+', value: 70 },
];

const SORT_OPTIONS: Array<{ label: string; value: SortOption; matchOnly?: boolean }> = [
  { label: 'Best match', value: 'match', matchOnly: true },
  { label: 'Highest salary', value: 'salary-desc' },
  { label: 'Lowest salary', value: 'salary-asc' },
  { label: 'Experience requirement', value: 'experience' },
];

export function FilterBar({
  filters,
  locations,
  onChange,
  showMatchFilter = true,
  showMatchSort = true,
}: FilterBarProps) {
  const update = (patch: Partial<JobFilters>) => onChange({ ...filters, ...patch });

  const onSelect = (event: ChangeEvent<HTMLSelectElement>, key: keyof JobFilters) => {
    const value = event.target.value;
    if (key === 'minMatch') {
      update({ minMatch: value === 'All' ? null : Number(value) });
      return;
    }
    update({ [key]: value } as Partial<JobFilters>);
  };

  return (
    <form className="filter-bar" onSubmit={(event) => event.preventDefault()}>
      <label className="filter-search">
        Search
        <span className="filter-search-field">
          <SearchIcon />
          <input
            type="search"
            placeholder="Search jobs..."
            value={filters.search}
            onChange={(event) => update({ search: event.target.value })}
          />
        </span>
      </label>

      <label>
        Location
        <select value={filters.location} onChange={(event) => onSelect(event, 'location')}>
          <option value="All">All</option>
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </label>

      <label>
        Employment
        <select value={filters.employmentType} onChange={(event) => onSelect(event, 'employmentType')}>
          {EMPLOYMENT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option === 'All' ? 'All' : option.replaceAll('_', ' ')}
            </option>
          ))}
        </select>
      </label>

      {showMatchFilter ? (
        <label>
          Min match
          <select
            value={filters.minMatch ?? 'All'}
            onChange={(event) => onSelect(event, 'minMatch')}
          >
            {MATCH_OPTIONS.map((option) => (
              <option key={option.label} value={option.value ?? 'All'}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <label>
        Sort by
        <select value={filters.sort} onChange={(event) => onSelect(event, 'sort')}>
          {SORT_OPTIONS.filter((option) => showMatchSort || !option.matchOnly).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </form>
  );
}
