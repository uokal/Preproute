import React, { useRef } from "react";
import { BarChart3, Bell, Calendar, ChevronDown, ChevronsRight, CircleCheck, CircleMinus, Clock3, FileQuestion, Pencil, Plus, Search, X } from "lucide-react";
import { Link } from "react-router-dom";

const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

const buttonBase =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-[7px] border-0 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/25 disabled:cursor-not-allowed disabled:opacity-60";
const buttonVariants = {
  primary: "bg-brand-primary text-white shadow-none hover:bg-brand-primary/90 active:bg-brand-primary/80",
  secondary: "bg-brand-secondary text-brand-secondaryText shadow-none hover:bg-brand-secondary/80 active:bg-brand-secondary/70",
  ghost: "bg-transparent text-brand-secondaryText hover:bg-brand-secondary active:bg-brand-secondary/70",
  danger: "bg-brand-danger text-white shadow-none hover:bg-brand-danger/90 active:bg-brand-danger/80"
};
const buttonSizes = {
  sm: "min-h-9 min-w-24 px-4 text-sm",
  md: "min-h-12 min-w-40 px-6 text-base",
  lg: "min-h-12 min-w-40 px-8 text-base"
};

const fieldBase = "relative grid gap-3 font-medium text-brand-ink";
const controlBase =
  "min-h-12 w-full rounded-[7px] border border-[#cbd2dc] bg-white px-4 text-brand-ink outline-none transition-colors duration-200 placeholder:text-[#c8ced8] hover:border-[#aeb8c8] focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20";
const selectBase =
  "appearance-none bg-[linear-gradient(45deg,transparent_50%,#697185_50%),linear-gradient(135deg,#697185_50%,transparent_50%)] bg-[length:7px_7px,7px_7px] bg-[position:calc(100%_-_20px)_52%,calc(100%_-_14px)_52%] bg-no-repeat pr-10 text-[#667085]";
const cardBase = "min-w-0 rounded-[7px] border border-brand-line bg-white p-5";
const skeletonBase =
  "block rounded-[7px] bg-gradient-to-r from-[#eef1f6] via-[#f7f9fc] to-[#eef1f6] bg-[length:220%_100%] animate-[skeleton_1.35s_ease-in-out_infinite]";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
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
    className={cn(buttonBase, buttonVariants[variant], buttonSizes[size], fullWidth && "w-full", className)}
    disabled={disabled || isLoading}
    aria-busy={isLoading || undefined}
    {...props}
  >
    {isLoading ? <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-current opacity-70" aria-hidden="true" /> : null}
    {children}
  </button>
);

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  tone?: "default" | "danger" | "plain";
};

const iconButtonTone = {
  default: "bg-brand-secondary text-brand-secondaryText hover:bg-brand-secondary/80",
  danger: "bg-brand-secondary text-[#f05d68] hover:bg-[#fff0f2]",
  plain: "bg-transparent text-brand-primary hover:bg-brand-secondary"
};

export const IconButton = ({ label, tone = "default", className = "", children, ...props }: IconButtonProps) => (
  <button
    className={cn(
      "inline-grid h-9 w-9 place-items-center rounded-[7px] border-0 no-underline transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/25",
      iconButtonTone[tone],
      className
    )}
    type="button"
    aria-label={label}
    title={label}
    {...props}
  >
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
  <Link
    className={cn(
      "inline-grid h-9 w-9 place-items-center rounded-[7px] border-0 no-underline transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/25",
      iconButtonTone[tone]
    )}
    to={to}
    aria-label={label}
    title={label}
  >
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
  <div className="flex w-fit rounded-[7px] border border-brand-line p-1" role="tablist" aria-label={ariaLabel}>
    {options.map((option) => (
      <button
        className={cn(
          "min-h-9 cursor-pointer rounded-[7px] border-0 bg-transparent px-5 text-sm font-medium text-[#9aa3b2] transition-colors duration-200 hover:bg-brand-secondary hover:text-brand-secondaryText",
          value === option.value && "bg-brand-secondary font-semibold text-brand-blue"
        )}
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

export const QuestionRailButton = ({ index, done, current, label }: { index: number; done: boolean; current?: boolean; label?: string }) => (
  <button
    className={cn(
      "flex h-[50px] w-full items-center gap-2 rounded-[15px] border px-3 py-3 text-sm transition-colors duration-200",
      done ? "border-[#63cba3] bg-[#f8fffc] text-[#0fa56d] hover:bg-[#effcf7]" : "border-[#ebedf2] bg-white text-[#c8ced8] hover:bg-brand-secondary"
    )}
    type="button"
  >
    {done ? <CircleCheck fill="#0C9D61" stroke="#fff" size={24} /> : <CircleMinus fill={current ? "#D1D5DB" : "#D1D5DB"} stroke="#fff" size={24} />}
    <span className="whitespace-nowrap">{label ?? `Question ${index + 1}`}</span>
    <ChevronsRight stroke={done ? "#0C9D61" : "#D1D5DB"} size={16} />
  </button>
);

export const QuestionRailAddButton = ({ onClick }: { onClick: () => void }) => (
  <button
    className="flex h-9 w-full items-center justify-center gap-2 rounded-[7px] border border-brand-line bg-brand-secondary px-3 text-sm font-semibold text-brand-secondaryText transition-colors duration-200 hover:bg-brand-secondary/80 focus:outline-none focus:ring-2 focus:ring-brand-primary/25"
    type="button"
    onClick={onClick}
  >
    <Plus size={16} />
    MCQ
  </button>
);

export const NotificationButton = () => (
  <button className="relative grid h-11 w-11 place-items-center rounded-full border border-[#ccd3df] bg-white transition-colors duration-200 hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary/25" type="button" aria-label="Notifications" title="Notifications">
    <Bell size={18} />
    <span className="absolute right-2.5 top-2.5 h-[9px] w-[9px] rounded-full bg-[#0faa6c]" />
  </button>
);

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export const Input = React.forwardRef<HTMLInputElement, FieldProps>(({ label, error, hint, className = "", ...props }, ref) => (
  <label className={fieldBase}>
    {label ? <span>{label}</span> : null}
    <input ref={ref} className={cn(controlBase, error && "border-[#ff7b86]", className)} {...props} />
    {hint ? <small className="text-xs font-normal text-[#98a1b3]">{hint}</small> : null}
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
    <label className={fieldBase}>
      <span>{label}</span>
      <select ref={ref} className={cn(controlBase, selectBase, error && "border-[#ff7b86]", className)} {...props}>
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

export const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <section className={cn(cardBase, className)}>{children}</section>
);

export const FormError = ({ message }: { message?: string }) => (message ? <small className="text-xs font-semibold text-[#e44855]">{message}</small> : null);

export const Loader = ({ label = "Loading" }: { label?: string }) => (
  <div className="flex items-center justify-center p-4 text-center text-brand-muted" role="status" aria-live="polite">
    <span className={cn(skeletonBase, "w-28")} aria-hidden="true" />
    <span className="sr-only">{label}</span>
  </div>
);

export const SkeletonBlock = ({ className = "" }: { className?: string }) => (
  <span className={cn(skeletonBase, className)} aria-hidden="true" />
);

export const StatsCard = ({
  label,
  value,
  tone = "blue"
}: {
  label: string;
  value: number;
  tone?: "blue" | "amber" | "green" | "slate";
}) => {
  const toneClass = {
    blue: "border-l-brand-primary",
    amber: "border-l-[#ffbf3d]",
    green: "border-l-[#18a56f]",
    slate: "border-l-[#697185]"
  }[tone];

  return (
    <Card className={cn("grid gap-1.5 overflow-hidden border-l-4", toneClass)}>
      <span className="text-sm font-semibold text-brand-muted">{label}</span>
      <strong className="text-3xl font-bold text-brand-ink">{value}</strong>
    </Card>
  );
};

export const StatsSkeleton = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Loading dashboard statistics">
    {[0, 1, 2, 3].map((item) => (
      <Card className="grid gap-1.5 overflow-hidden border-l-4" key={item}>
        <SkeletonBlock className="h-4 w-24" />
        <SkeletonBlock className="mt-3 h-8 w-16" />
      </Card>
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) => (
  <div className="grid gap-0 overflow-x-auto" aria-label="Loading table rows">
    {Array.from({ length: rows }, (_, row) => (
      <div className="grid min-w-[720px] grid-cols-[1.3fr_1fr_1.2fr_.8fr_1fr_.8fr] items-center gap-4 border-b border-[#edf0f5] px-3 py-4" key={row}>
        {Array.from({ length: columns }, (_, column) => (
          <SkeletonBlock className={column === 0 ? "h-4 w-36" : "h-4 w-24"} key={column} />
        ))}
      </div>
    ))}
  </div>
);

export const FormSkeleton = ({ rows = 6 }: { rows?: number }) => (
  <Card className="grid grid-cols-1 gap-x-12 gap-y-7 md:grid-cols-2" aria-label="Loading form">
    {Array.from({ length: rows }, (_, row) => (
      <div className={fieldBase} key={row}>
        <SkeletonBlock className="h-4 w-28" />
        <SkeletonBlock className="h-12 w-full" />
      </div>
    ))}
  </Card>
);

export const DetailSkeleton = () => (
  <Card className="min-h-[150px]" aria-label="Loading details">
    <SkeletonBlock className="h-6 w-28" />
    <SkeletonBlock className="mt-5 h-7 w-64" />
    <SkeletonBlock className="mt-5 h-4 w-full max-w-[620px]" />
    <SkeletonBlock className="mt-3 h-4 w-3/4" />
  </Card>
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
  <div className="grid justify-items-center gap-2.5 px-4 py-10 text-center text-brand-muted">
    <strong className="text-lg text-brand-ink">{title}</strong>
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
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/30 p-5" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="w-[min(780px,100%)] rounded-[12px] bg-white p-8">
        <div className="flex items-center justify-between gap-3.5">
          <h2 id="modal-title" className="m-0 text-xl font-bold">
            {title}
          </h2>
          <IconButton label="Close modal" tone="plain" onClick={onClose}>
            <X size={20} />
          </IconButton>
        </div>
        {children}
      </div>
    </div>
  ) : null;

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
    <div className="relative flex min-h-12 w-full cursor-pointer items-center rounded-[7px] border border-[#cbd2dc] bg-white px-4" onClick={() => ref.current?.showPicker?.()}>
      <input ref={ref} type="date" className="absolute inset-0 h-full w-full cursor-pointer opacity-0" aria-label={placeholder} value={value ?? ""} onChange={(e) => onChange?.(e.target.value)} />
      {!value && <span className="flex-1 text-sm text-[#c8ced8]">{placeholder}</span>}
      <Calendar size={18} className="flex-shrink-0 text-[#c8ced8]" />
    </div>
  );
};

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
  <div className="relative flex min-h-12 w-full items-center rounded-[7px] border border-[#cbd2dc] bg-white">
    <select className="h-full min-h-12 w-full cursor-pointer appearance-none border-0 bg-transparent px-4 pr-10 text-[#c8ced8] outline-none" value={value ?? ""} aria-label={placeholder} onChange={(e) => onChange?.(e.target.value)}>
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
    <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#c8ced8]" />
  </div>
);

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
  <div className="flex min-h-12 items-center justify-between rounded-[7px] border border-[#cbd2dc] bg-white px-4">
    <span className="font-medium text-brand-ink">{value >= 0 ? `+${value}` : value}</span>
    <div className="flex flex-col">
      <button className="h-4 w-4 cursor-pointer border-0 bg-transparent p-0 text-[10px] leading-none text-[#9aa3b2] hover:text-brand-primary" type="button" onClick={() => onChange(max !== undefined ? Math.min(max, value + 1) : value + 1)}>
        ▲
      </button>
      <button className="h-4 w-4 cursor-pointer border-0 bg-transparent p-0 text-[10px] leading-none text-[#9aa3b2] hover:text-brand-primary" type="button" onClick={() => onChange(min !== undefined ? Math.max(min, value - 1) : value - 1)}>
        ▼
      </button>
    </div>
  </div>
);

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
  <label className="flex cursor-pointer items-center gap-3 text-[15px] text-brand-ink">
    <span className={cn("flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#c8ced8]", checked && "border-brand-primary")}>{checked && <span className="h-2.5 w-2.5 rounded-full bg-brand-primary" />}</span>
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
  <div className="max-w-full overflow-x-auto overscroll-x-contain pb-1">
    <table className="min-w-[720px] w-full border-collapse">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column} className="whitespace-nowrap border-b border-[#edf0f5] px-3 py-4 text-left text-[13px] font-medium text-[#7d8698]">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index} className="hover:bg-[#f7f9fe]">
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} className="max-w-[220px] break-words border-b border-[#edf0f5] px-3 py-4 text-left text-sm text-brand-ink">
                {cell}
              </td>
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
    <div className="max-w-full overflow-x-auto overscroll-x-contain pt-4">
      <div className="flex w-max min-w-full items-center justify-start gap-1 md:justify-end">
        <button type="button" aria-label="Previous page" onClick={() => onChange(page - 1)} disabled={page === 1} className="flex h-9 w-9 items-center justify-center rounded-[7px] border border-[#dfe4ee] bg-white text-sm text-brand-ink transition-colors duration-200 hover:bg-brand-secondary disabled:cursor-not-allowed disabled:opacity-40">
          ‹
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            aria-label={`Page ${p}`}
            aria-current={p === page ? "page" : undefined}
            onClick={() => onChange(p)}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-[7px] border text-sm font-medium transition",
              p === page ? "border-brand-primary bg-brand-primary text-white hover:bg-brand-primary/90" : "border-[#dfe4ee] bg-white text-brand-ink hover:bg-brand-secondary"
            )}
          >
            {p}
          </button>
        ))}
        <button type="button" aria-label="Next page" onClick={() => onChange(page + 1)} disabled={page === totalPages} className="flex h-9 w-9 items-center justify-center rounded-[7px] border border-[#dfe4ee] bg-white text-sm text-brand-ink transition-colors duration-200 hover:bg-brand-secondary disabled:cursor-not-allowed disabled:opacity-40">
          ›
        </button>
      </div>
    </div>
  );
};

export const SearchBox = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
  <label className="flex h-11 w-[min(420px,100%)] items-center gap-2.5 rounded-[7px] border border-brand-line px-3.5">
    <Search size={17} />
    <input className="w-full border-0 outline-none" value={value} onChange={(event) => onChange(event.target.value)} placeholder="Search tests" aria-label="Search tests" />
  </label>
);

export const Logo = ({ className = "" }: { className?: string }) => <img className={cn("block h-auto w-[171px]", className)} src="/assets/logo.png" alt="PrepRoute" />;

export const UserAvatar = ({ src, name, role }: { src?: string; name: string; role?: string }) => (
  <div className="flex items-center gap-2.5">
    <div className="h-11 w-11 overflow-hidden rounded-full border border-brand-line">
      {src ? <img src={src} alt={name} className="h-full w-full object-cover" /> : <div className="grid h-11 w-11 place-items-center rounded-full border border-brand-primary bg-[#ffd98e] text-sm font-extrabold text-[#223047]">{name.slice(0, 2).toUpperCase()}</div>}
    </div>
    <div className="grid">
      <strong className="text-[15px] font-bold leading-tight text-brand-ink">{name}</strong>
      {role && <small className="text-[12px] text-brand-muted">{role}</small>}
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
  <Card className="min-h-[150px]">
    <div className="flex justify-between">
      <span className="inline-flex items-center gap-2 rounded-full bg-brand-navy px-3 py-1 text-[13px] text-white">{test.type}</span>
      {onEdit ? (
        <IconButton label="Edit test" tone="plain" onClick={onEdit}>
          <Pencil size={18} />
        </IconButton>
      ) : null}
    </div>
    <div className="mt-4 flex items-end justify-between gap-5 max-[720px]:flex-col max-[720px]:items-stretch">
      <div>
        <div className="flex items-center gap-2.5">
          <span>♣</span>
          <h2 className="m-0 text-lg font-bold text-black">{test.name}</h2>
          <span className="inline-flex min-w-[100px] items-center justify-center gap-2 rounded-full bg-[#2cb7aa] px-3 py-1 text-[13px] text-white">{test.difficulty}</span>
        </div>
        <dl className="mt-5 grid gap-3">
          <div className="grid grid-cols-[98px_1fr] gap-2">
            <dt className="text-[13px] text-[#737b8c]">Subject</dt>
            <dd className="m-0 text-[#596173]">{test.subject}</dd>
          </div>
          <div className="grid grid-cols-[98px_1fr] gap-2">
            <dt className="text-[13px] text-[#737b8c]">Topic</dt>
            <dd className="m-0 text-[#596173]">
              {test.topics.map((topic) => (
                <span className="mr-1.5 inline-flex items-center gap-2 rounded-full border border-[#ffbf3d] bg-white px-3 py-1 text-[13px] text-[#ffb323]" key={topic}>
                  {topic}
                </span>
              ))}
            </dd>
          </div>
          <div className="grid grid-cols-[98px_1fr] gap-2">
            <dt className="text-[13px] text-[#737b8c]">Sub Topic</dt>
            <dd className="m-0 text-[#596173]">
              {test.subTopics.map((topic) => (
                <span className="mr-1.5 inline-flex items-center gap-2 rounded-full border border-[#ffbf3d] bg-white px-3 py-1 text-[13px] text-[#ffb323]" key={topic}>
                  {topic}
                </span>
              ))}
            </dd>
          </div>
        </dl>
      </div>
      {!compact ? (
        <div className="flex gap-0 rounded-[7px] border border-brand-line px-3 py-2 text-[#495266] max-[720px]:flex-wrap">
          <span className="inline-flex items-center gap-1.5 border-r border-[#edf0f5] px-3 text-sm last:border-r-0">
            <Clock3 size={14} className="text-[#c8ced8]" /> {test.totalTime} Min
          </span>
          <span className="inline-flex items-center gap-1.5 border-r border-[#edf0f5] px-3 text-sm last:border-r-0">
            <FileQuestion size={14} className="text-[#c8ced8]" /> {test.totalQuestions} Q's
          </span>
          <span className="inline-flex items-center gap-1.5 border-r border-[#edf0f5] px-3 text-sm last:border-r-0">
            <BarChart3 size={14} className="text-[#c8ced8]" /> {test.totalMarks} Marks
          </span>
        </div>
      ) : null}
    </div>
  </Card>
);
