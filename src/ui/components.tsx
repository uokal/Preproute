import React, { useState, useRef, useEffect } from "react";
import { Bell, Calendar, ChevronDown, ChevronsRight, CircleCheck, CircleMinus, Loader2, Pencil, Search, X } from "lucide-react";
import { Link } from "react-router-dom";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  isLoading?: boolean;
};

export const Button = ({
  className = "",
  variant = "primary",
  size = "md",
  fullWidth,
  isLoading,
  children,
  disabled,
  ...props
}: ButtonProps) => (
  <button
    className={`btn btn-${variant} btn-${size} ${fullWidth ? "btn-full" : ""} ${className}`}
    disabled={disabled || isLoading}
    {...props}
  >
    {isLoading ? <Loader2 size={16} className="spin" /> : null}
    {children}
  </button>
);

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  tone?: "default" | "danger" | "plain";
};

export const IconButton = ({ label, tone = "default", className = "", children, ...props }: IconButtonProps) => (
  <button className={`icon-button icon-button-${tone} ${className}`} type="button" aria-label={label} title={label} {...props}>
    {children}
  </button>
);

export const IconLink = ({
  label,
  to,
  tone = "default",
  children
}: {
  label: string;
  to: string;
  tone?: "default" | "danger" | "plain";
  children: React.ReactNode;
}) => (
  <Link className={`icon-button icon-button-${tone}`} to={to} aria-label={label} title={label}>
    {children}
  </Link>
);

export const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
  ariaLabel
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}) => (
  <div className="seg-tabs" role="tablist" aria-label={ariaLabel}>
    {options.map((option) => (
      <button
        className={value === option.value ? "active" : ""}
        type="button"
        role="tab"
        aria-selected={value === option.value}
        key={option.value}
        onClick={() => onChange(option.value)}
      >
        {option.label}
      </button>
    ))}
  </div>
);

export const QuestionRailButton = ({ index, done, label }: { index: number; done: boolean; label?: string }) => (
  <button className={`rail-btn px-1 ${done ? "done" : ""}`} type="button">
    {done ? <span> <CircleCheck fill="#0C9D61" stroke="#fff" size={24} /></span> : <span >  <CircleMinus fill="#D1D5DB" stroke="#fff" size={24}/></span>}
    <span>{label ?? `Question ${index + 1}`}</span>
    {done ? <span> <ChevronsRight stroke="#0C9D61" size={16} /></span> : <span >  <ChevronsRight stroke="#D1D5DB" size={16}/></span>}
  </button>
);

export const NotificationButton = () => (
  <button className="bell-btn" type="button" aria-label="Notifications" title="Notifications">
    <Bell size={18} />
    <span className="bell-dot" />
  </button>
);

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export const Input = React.forwardRef<HTMLInputElement, FieldProps>(({ label, error, hint, className = "", ...props }, ref) => (
  <label className="field">
    <span>{label}</span>
    <input ref={ref} className={`control ${error ? "control-error" : ""} ${className}`} {...props} />
    {hint ? <small className="field-hint">{hint}</small> : null}
    <FormError message={error} />
  </label>
));
Input.displayName = "Input";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  options: Array<string | { value: string; label: string }>;
  placeholder?: string;
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder = "Choose from Drop-down", className = "", ...props }, ref) => (
    <label className="field">
      <span>{label}</span>
      <select ref={ref} className={`control select ${error ? "control-error" : ""} ${className}`} {...props}>
        <option value="">{placeholder}</option>
        {options.map((option) => {
          const normalized = typeof option === "string" ? { value: option, label: option } : option;
          return (
          <option key={normalized.value} value={normalized.value}>
            {normalized.label}
          </option>
          );
        })}
      </select>
      <FormError message={error} />
    </label>
  )
);
Select.displayName = "Select";

export const MultiSelect = ({
  label,
  value,
  options,
  onChange,
  error
}: {
  label: string;
  value: string[];
  options: Array<string | { value: string; label: string }>;
  onChange: (value: string[]) => void;
  error?: string;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const normalized = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  const selectedLabels = normalized.filter((o) => value.includes(o.value)).map((o) => o.label);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (val: string) =>
    onChange(value.includes(val) ? value.filter((v) => v !== val) : [...value, val]);

  return (
    <div className="field" ref={ref}>
      <span>{label}</span>
      <div
        className={`control select cursor-pointer flex items-center justify-between gap-2 ${error ? "control-error" : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="flex flex-wrap gap-1 flex-1 min-w-0">
          {selectedLabels.length === 0 ? (
            <span className="text-[#9aa3b2]">Choose from Drop-down</span>
          ) : (
            selectedLabels.map((l) => (
              <span key={l} className="inline-flex items-center gap-1 bg-[#eef1fd] text-brand-blue text-xs px-2 py-0.5 rounded-full">
                {l}
              </span>
            ))
          )}
        </span>
        <ChevronDown size={16} className={`shrink-0 text-brand-ink transition-transform ${open ? "rotate-180" : ""}`} />
      </div>
      {open && normalized.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-[#dfe4ee] bg-white shadow-lg max-h-52 overflow-y-auto">
          {normalized.map((o) => (
            <label
              key={o.value}
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#f4f6ff] text-sm text-brand-ink"
            >
              <input
                type="checkbox"
                checked={value.includes(o.value)}
                onChange={() => toggle(o.value)}
                className="accent-brand-blue"
              />
              {o.label}
            </label>
          ))}
        </div>
      )}
      <FormError message={error} />
    </div>
  );
};

export const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <section className={`card ${className}`}>{children}</section>
);

export const FormError = ({ message }: { message?: string }) => (message ? <small className="form-error">{message}</small> : null);

export const Loader = ({ label = "Loading" }: { label?: string }) => (
  <div className="state state-inline">
    <Loader2 className="spin" size={18} />
    <span>{label}</span>
  </div>
);

export const EmptyState = ({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) => (
  <div className="state empty-state">
    <strong>{title}</strong>
    <p>{description}</p>
    {action}
  </div>
);

export const Modal = ({
  title,
  open,
  children,
  onClose
}: {
  title: string;
  open: boolean;
  children: React.ReactNode;
  onClose: () => void;
}) =>
  open ? (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-head">
          <h2>{title}</h2>
          <IconButton label="Close modal" tone="plain" onClick={onClose}>
            <X size={20} />
          </IconButton>
        </div>
        {children}
      </div>
    </div>
  ) : null;

/** Reusable date picker input matching the design */
export const DateInput = ({
  placeholder = "Select Date",
  value,
  onChange
}: {
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
}) => {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="date-field" onClick={() => ref.current?.showPicker?.()}>
      <input
        ref={ref}
        type="date"
        className="date-field-input"
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
      />
      {!value && <span className="date-field-placeholder">{placeholder}</span>}
      <Calendar size={18} className="date-field-icon" />
    </div>
  );
};

/** Reusable time dropdown matching the design */
export const TimeSelect = ({
  placeholder = "Select Time",
  value,
  onChange,
  options = ["10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM", "11:59 PM"]
}: {
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
  options?: string[];
}) => (
  <div className="time-field">
    <select
      className="time-field-select"
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
    <ChevronDown size={18} className="time-field-icon" />
  </div>
);

/** Spinner number input (Wrong/Correct/Unattempted marks) */
export const SpinnerInput = ({
  value,
  onChange,
  min,
  max
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) => (
  <div className="spinner-input">
    <span>{value >= 0 ? `+${value}` : value}</span>
    <div className="spinner-arrows">
      <button type="button" onClick={() => onChange(max !== undefined ? Math.min(max, value + 1) : value + 1)}>▲</button>
      <button type="button" onClick={() => onChange(min !== undefined ? Math.max(min, value - 1) : value - 1)}>▼</button>
    </div>
  </div>
);

/** Reusable radio option row */
export const RadioOption = ({
  name,
  value,
  checked,
  onChange,
  label
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  label: string;
}) => (
  <label className="radio-option">
    <span className={`radio-circle ${checked ? "radio-checked" : ""}`}>
      {checked && <span className="radio-dot" />}
    </span>
    <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
    {label}
  </label>
);

export const DataTable = ({
  columns,
  rows
}: {
  columns: string[];
  rows: Array<Array<React.ReactNode>>;
}) => (
  <div className="w-full overflow-x-auto">
    <table className="w-full border-collapse">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column} className="border-b border-[#edf0f5] px-3 py-4 text-left text-[13px] font-medium text-[#7d8698] whitespace-nowrap">{column}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index} className="hover:bg-[#f7f9fe]">
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} className="border-b border-[#edf0f5] px-3 py-4 text-left text-sm text-brand-ink max-w-[220px] break-words">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const Pagination = ({
  page,
  total,
  pageSize,
  onChange
}: {
  page: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}) => {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-end gap-1 pt-4">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="flex h-9 w-9 items-center justify-center rounded-[7px] border border-[#dfe4ee] bg-white text-sm text-brand-ink disabled:opacity-40 hover:bg-[#f4f6ff] disabled:cursor-not-allowed"
      >
        ‹
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`flex h-9 w-9 items-center justify-center rounded-[7px] border text-sm font-medium transition ${
            p === page
              ? "border-brand-primary bg-brand-primary text-white"
              : "border-[#dfe4ee] bg-white text-brand-ink hover:bg-[#f4f6ff]"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="flex h-9 w-9 items-center justify-center rounded-[7px] border border-[#dfe4ee] bg-white text-sm text-brand-ink disabled:opacity-40 hover:bg-[#f4f6ff] disabled:cursor-not-allowed"
      >
        ›
      </button>
    </div>
  );
};

export const SearchBox = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
  <label className="search-box">
    <Search size={17} />
    <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Search tests" />
  </label>
);

export const Logo = () => (
  <img className="logo-img" src="/assets/logo.png" alt="PrepRoute" />
);

export const UserAvatar = ({ src, name, role }: { src?: string; name: string; role?: string }) => (
  <div className="user-profile">
    <div className="avatar-wrap">
      {src ? <img src={src} alt={name} className="avatar-img" /> : <div className="avatar">{name.slice(0, 2).toUpperCase()}</div>}
    </div>
    <div className="user-info">
      <strong>{name}</strong>
      {role && <small>{role}</small>}
    </div>
    <ChevronDown size={16} className="text-brand-ink" />
  </div>
);

export const TestSummaryCard = ({
  test,
  compact = false,
  onEdit
}: {
  test: import("../types").Test;
  compact?: boolean;
  onEdit?: () => void;
}) => (
  <Card className="summary-card">
    <div className="summary-top">
      <span className="pill dark">{test.type}</span>
      {onEdit ? (
        <IconButton label="Edit test" tone="plain" onClick={onEdit}>
          <Pencil size={18} />
        </IconButton>
      ) : null}
    </div>
    <div className="summary-main">
      <div>
        <div className="title-line">
          <span className="chapter-icon">♣</span>
          <h2>{test.name}</h2>
          <span className="pill teal">{test.difficulty}</span>
        </div>
        <dl className="summary-details">
          <div>
            <dt>Subject</dt>
            <dd>{test.subject}</dd>
          </div>
          <div>
            <dt>Topic</dt>
            <dd>
              {test.topics.map((topic) => (
                <span className="tag" key={topic}>
                  {topic}
                </span>
              ))}
            </dd>
          </div>
          <div>
            <dt>Sub Topic</dt>
            <dd>
              {test.subTopics.map((topic) => (
                <span className="tag" key={topic}>
                  {topic}
                </span>
              ))}
            </dd>
          </div>
        </dl>
      </div>
      {!compact ? (
        <div className="metrics">
          <span>{test.totalTime} Min</span>
          <span>{test.totalQuestions} Q's</span>
          <span>{test.totalMarks} Marks</span>
        </div>
      ) : null}
    </div>
  </Card>
);
