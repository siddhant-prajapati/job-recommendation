import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChipMultiSelect } from '../components/candidate/ChipMultiSelect';
import { LocationField } from '../components/common/LocationField';
import { Button } from '../components/common/Button';
import { PageHeader } from '../components/layout/PageHeader';
import { useCompanies } from '../hooks/useCompanies';
import { useCreateJob } from '../hooks/useJob';
import { useLocations } from '../hooks/useLocations';
import { useSkills } from '../hooks/useSkills';
import { getErrorMessage } from '../services/api/errors';
import { EMPLOYMENT_TYPES } from '../types/job';
import { formatEmploymentType } from '../utils/formatting';

export function CreateJobPage() {
  const navigate = useNavigate();
  const skillsQuery = useSkills();
  const companiesQuery = useCompanies();
  const locationsQuery = useLocations();
  const createMutation = useCreateJob();

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [minExperienceYears, setMinExperienceYears] = useState('0');
  const [salaryLpa, setSalaryLpa] = useState('');
  const [employmentType, setEmploymentType] = useState('FULL_TIME');
  const [companyId, setCompanyId] = useState('');
  const [skillIds, setSkillIds] = useState<number[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const companies = companiesQuery.data ?? [];
  const skills = skillsQuery.data ?? [];

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const years = Number(minExperienceYears);
    const selectedCompanyId = Number(companyId);
    const lpa = salaryLpa.trim() === '' ? null : Number(salaryLpa);

    if (!title.trim() || !location.trim()) {
      setFormError('Title and location are required.');
      return;
    }
    if (!Number.isFinite(years) || years < 0) {
      setFormError('Experience must be 0 or more.');
      return;
    }
    if (!Number.isInteger(selectedCompanyId) || selectedCompanyId <= 0) {
      setFormError('Select a company.');
      return;
    }
    if (skillIds.length === 0) {
      setFormError('Select at least one required skill.');
      return;
    }
    if (lpa != null && (!Number.isFinite(lpa) || lpa < 0)) {
      setFormError('Salary must be a positive number in LPA.');
      return;
    }

    createMutation.mutate(
      {
        title: title.trim(),
        location: location.trim(),
        minExperienceYears: years,
        salary: lpa == null ? null : Math.round(lpa * 100_000),
        employmentType,
        companyId: selectedCompanyId,
        skillIds,
      },
      {
        onSuccess: (job) => {
          void navigate(`/jobs/${job.id}`);
        },
      },
    );
  };

  return (
    <div className="page page-narrow">
      <PageHeader
        backTo="/jobs"
        backLabel="Back to jobs"
        title="Add job"
        subtitle="Creates a job in the graph with a company and required skills."
      />

      <form className="panel" onSubmit={onSubmit}>
        <fieldset className="form-grid form-fieldset" disabled={createMutation.isPending}>
        <label>
          Title
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Senior Java Developer"
          />
        </label>

        <LocationField
          inputId="job-location"
          value={location}
          onChange={setLocation}
          query={locationsQuery}
        />

        <label>
          Minimum experience (years)
          <input
            required
            type="number"
            min={0}
            step={1}
            value={minExperienceYears}
            onChange={(event) => setMinExperienceYears(event.target.value)}
          />
        </label>

        <label>
          Salary (LPA, optional)
          <input
            type="number"
            min={0}
            step={0.1}
            value={salaryLpa}
            onChange={(event) => setSalaryLpa(event.target.value)}
            placeholder="18"
          />
        </label>

        <label>
          Employment type
          <select value={employmentType} onChange={(event) => setEmploymentType(event.target.value)}>
            {EMPLOYMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {formatEmploymentType(type)}
              </option>
            ))}
          </select>
        </label>

        <label>
          Company
          <select
            required
            value={companyId}
            onChange={(event) => setCompanyId(event.target.value)}
            disabled={companiesQuery.isPending}
          >
            <option value="">{companiesQuery.isPending ? 'Loading companies…' : 'Select company'}</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </label>
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

        <div>
          <ChipMultiSelect
            legend="Required skills"
            options={skills}
            selectedIds={skillIds}
            onChange={setSkillIds}
            emptyMessage={
              skillsQuery.isError
                ? 'Could not load skills. Retry before creating a job.'
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

        {formError ? (
          <p className="form-error" role="alert">
            {formError}
          </p>
        ) : null}
        {createMutation.isError ? (
          <p className="form-error" role="alert">
            {getErrorMessage(createMutation.error, 'We could not create this job.')}
          </p>
        ) : null}

        <Button type="submit" variant="warm" disabled={createMutation.isPending || companies.length === 0 || skills.length === 0}>
          {createMutation.isPending ? 'Saving…' : 'Create job'}
        </Button>
        </fieldset>
      </form>
    </div>
  );
}
