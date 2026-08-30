import { SearchIcon } from "./Icons";

export type ResultFilter = "ALL" | "PASS" | "FAIL";

export type EdgeFilter =
  | "ALL"
  | "COMPULSORY_FAIL"
  | "PRACTICAL_FAIL"
  | "OPTIONAL_REVIEW"
  | "ABSENT";

interface FilterBarProps {
  search: string;
  classFilter: string;
  resultFilter: ResultFilter;
  edgeFilter: EdgeFilter;
  classes: string[];

  onSearchChange: (value: string) => void;
  onClassChange: (value: string) => void;
  onResultChange: (value: ResultFilter) => void;
  onEdgeChange: (value: EdgeFilter) => void;
  onReset: () => void;
}

export function FilterBar({
  search,
  classFilter,
  resultFilter,
  edgeFilter,
  classes,
  onSearchChange,
  onClassChange,
  onResultChange,
  onEdgeChange,
  onReset,
}: FilterBarProps) {
  return (
    <section className="filter-card">
      <label className="search-field">
        <SearchIcon />
        <input
          value={search}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          placeholder="Search student by name or ID..."
          aria-label="Search student"
        />
      </label>

      <label className="filter-field">
        <span>Class</span>
        <select
          value={classFilter}
          onChange={(event) =>
            onClassChange(event.target.value)
          }
        >
          <option value="ALL">All classes</option>

          {classes.map((className) => (
            <option key={className} value={className}>
              {className}
            </option>
          ))}
        </select>
      </label>

      <label className="filter-field">
        <span>Result</span>
        <select
          value={resultFilter}
          onChange={(event) =>
            onResultChange(
              event.target.value as ResultFilter
            )
          }
        >
          <option value="ALL">All results</option>
          <option value="PASS">Passed</option>
          <option value="FAIL">Failed</option>
        </select>
      </label>

      <label className="filter-field">
        <span>Edge case</span>
        <select
          value={edgeFilter}
          onChange={(event) =>
            onEdgeChange(event.target.value as EdgeFilter)
          }
        >
          <option value="ALL">All edge cases</option>
          <option value="COMPULSORY_FAIL">
            Compulsory fail
          </option>
          <option value="PRACTICAL_FAIL">
            Practical fail
          </option>
          <option value="OPTIONAL_REVIEW">
            Optional review
          </option>
          <option value="ABSENT">Absent</option>
        </select>
      </label>

      <button
        type="button"
        className="button button--secondary filter-reset"
        onClick={onReset}
      >
        Reset
      </button>
    </section>
  );
}
