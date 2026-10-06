import type { UseQueryResult } from '@tanstack/react-query';
import type { Location } from '../../types/location';

type LocationFieldProps = {
  value: string;
  onChange: (name: string) => void;
  query: UseQueryResult<Location[]>;
  inputId: string;
};

export function LocationField({ value, onChange, query, inputId }: LocationFieldProps) {
  const locations = query.data ?? [];

  return (
    <label>
      Location
      {locations.length > 0 ? (
        <select
          id={inputId}
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={query.isPending}
        >
          <option value="">{query.isPending ? 'Loading locations…' : 'Select location'}</option>
          {locations.map((location) => (
            <option key={location.id} value={location.name}>
              {location.name}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={inputId}
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Bengaluru"
          disabled={query.isPending}
        />
      )}
      {query.isError ? (
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            void query.refetch();
          }}
        >
          Retry locations
        </button>
      ) : null}
    </label>
  );
}
