type NamedOption = {
  id: number;
  name: string;
};

type ChipMultiSelectProps = {
  legend: string;
  options: NamedOption[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  emptyMessage?: string;
};

export function ChipMultiSelect({
  legend,
  options,
  selectedIds,
  onChange,
  emptyMessage = 'No options available yet.',
}: ChipMultiSelectProps) {
  const selected = new Set(selectedIds);

  const toggle = (id: number) => {
    if (selected.has(id)) {
      onChange(selectedIds.filter((value) => value !== id));
      return;
    }
    onChange([...selectedIds, id]);
  };

  return (
    <fieldset className="chip-fieldset">
      <legend>{legend}</legend>
      {options.length === 0 ? (
        <p className="muted">{emptyMessage}</p>
      ) : (
        <div className="skill-list">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              className={selected.has(option.id) ? 'skill-tag skill-tag-match' : 'skill-tag'}
              aria-pressed={selected.has(option.id)}
              onClick={() => toggle(option.id)}
            >
              {option.name}
            </button>
          ))}
        </div>
      )}
    </fieldset>
  );
}
