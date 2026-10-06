import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChipMultiSelect } from '../components/candidate/ChipMultiSelect';
import { LocationField } from '../components/common/LocationField';
import { Button } from '../components/common/Button';
import { PageHeader } from '../components/layout/PageHeader';
import { useCreateCandidate } from '../hooks/useCandidate';
import { useCompanies } from '../hooks/useCompanies';
import { useLocations } from '../hooks/useLocations';
import { useSkills } from '../hooks/useSkills';
import { getErrorMessage } from '../services/api/errors';

export function CreateCandidatePage() {
  const navigate = useNavigate();
  const skillsQuery = useSkills();
  const companiesQuery = useCompanies();
  const locationsQuery = useLocations();
  const createMutation = useCreateCandidate();

  const [name, setName] = useState('');
  const [experienceYears, setExperienceYears] = useState('0');
  const [location, setLocation] = useState('');
  const [skillIds, setSkillIds] = useState<number[]>([]);
  const [companyIds, setCompanyIds] = useState<number[]>([]);

  const skills = skillsQuery.data ?? [];
  const companies = companiesQuery.data ?? [];

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const years = Number(experienceYears);
    if (!name.trim() || !location.trim() || !Number.isFinite(years) || years < 0) {
      return;
    }

    createMutation.mutate(
      {
        name: name.trim(),
        experienceYears: years,
        location: location.trim(),
        skillIds,
        companyIds,
      },
      {
        onSuccess: (candidate) => {
          void navigate(`/candidates/${candidate.id}`);
        },
      },
    );
  };

  return (
    <div className="page page-narrow">
      <PageHeader
        backTo="/"
        backLabel="Back to dashboard"
        title="Add candidate"
        subtitle="Creates a candidate in the graph with skills and previous companies."
      />

      <form className="panel" onSubmit={onSubmit}>
        <fieldset className="form-grid form-fieldset" disabled={createMutation.isPending}>
        <label>
          Name
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Alice Sharma"
            autoComplete="name"
          />
        </label>

        <label>
          Experience (years)
          <input
            required
            type="number"
            min={0}
            step={1}
            value={experienceYears}
            onChange={(event) => setExperienceYears(event.target.value)}
          />
        </label>

        <LocationField
          inputId="candidate-location"
          value={location}
          onChange={setLocation}
          query={locationsQuery}
        />

        <div>
          <ChipMultiSelect
            legend="Skills"
            options={skills}
            selectedIds={skillIds}
            onChange={setSkillIds}
            emptyMessage={
              skillsQuery.isError
                ? 'Could not load skills. You can still save without skills.'
                : skillsQuery.isPending
                  ? 'Loading skills…'
                  : 'No skills available yet.'
            }
          />
          {skillsQuery.isError ? (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                void skillsQuery.refetch();
              }}
            >
              Retry skills
            </button>
          ) : null}
        </div>

        <div>
          <ChipMultiSelect
            legend="Previous companies"
            options={companies}
            selectedIds={companyIds}
            onChange={setCompanyIds}
            emptyMessage={
              companiesQuery.isError
                ? 'Could not load companies. You can still save without company history.'
                : companiesQuery.isPending
                  ? 'Loading companies…'
                  : 'No companies available yet.'
            }
          />
          {companiesQuery.isError ? (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                void companiesQuery.refetch();
              }}
            >
              Retry companies
            </button>
          ) : null}
        </div>

        {createMutation.isError ? (
          <p className="form-error" role="alert">
            {getErrorMessage(createMutation.error, 'We could not create this candidate.')}
          </p>
        ) : null}

        <Button type="submit" variant="warm" disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Saving…' : 'Create candidate'}
        </Button>
        </fieldset>
      </form>
    </div>
  );
}
