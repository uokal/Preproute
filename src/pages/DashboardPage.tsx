import { useCallback, useEffect, useMemo, useState } from "react";
import { Edit2, Eye, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../api/client";
import { testsService } from "../services/tests.service";
import { Test } from "../types";
import { Button, Card, DataTable, EmptyState, IconButton, IconLink, Modal, Pagination, SearchBox, StatsCard, StatsSkeleton, TableSkeleton } from "../ui/components";

const PAGE_SIZE = 10;

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState<Test[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTests = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      setTests(await testsService.list());
    } catch (loadError) {
      const message = getApiErrorMessage(loadError, "Unable to load tests.") ?? "";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadTests(); }, [loadTests]);

  const stats = useMemo(() => ({
    total: tests.length,
    draft: tests.filter((test) => test.status === "Draft").length,
    published: tests.filter((test) => test.status === "Published").length,
    questions: tests.reduce((sum, test) => sum + Number(test.totalQuestions || 0), 0)
  }), [tests]);

  const filtered = useMemo(() => {
    const needle = query.toLowerCase();
    return tests.filter((test) => [test.name, test.subject, test.status].join(" ").toLowerCase().includes(needle));
  }, [query, tests]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const handleSearch = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const remove = async () => {
    if (!deleteId) return;
    const previousTests = tests;
    const testToDelete = tests.find((test) => test.id === deleteId);
    setTests((current) => current.filter((test) => test.id !== deleteId));
    setDeleteId(null);
    try {
      await testsService.remove(deleteId);
      toast.success(`${testToDelete?.name ?? "Test"} deleted`);
    } catch (deleteError) {
      setTests(previousTests);
      toast.error(getApiErrorMessage(deleteError, "Unable to delete test."));
    }
  };

  return (
    <div className="mx-auto grid w-full min-w-0 max-w-[1160px] gap-5">
      <div className="flex items-center justify-between gap-4 max-[720px]:flex-col max-[720px]:items-stretch">
        <div>
          <p className="m-0 text-base text-[#666]">Test Creation / Dashboard</p>
          <h1 className="mb-0 mt-2 text-2xl font-bold">Test List</h1>
        </div>
        <Button size="lg" onClick={() => navigate("/tests/new")}>
          <Plus size={17} />
          Create New Test
        </Button>
      </div>
      {isLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Dashboard statistics">
          <StatsCard label="Total Tests" value={stats.total} tone="blue" />
          <StatsCard label="Draft Tests" value={stats.draft} tone="amber" />
          <StatsCard label="Published Tests" value={stats.published} tone="green" />
          <StatsCard label="Total Questions" value={stats.questions} tone="slate" />
        </div>
      )}
      <Card>
        <div className="mb-4 flex justify-between gap-4 max-[720px]:flex-col max-[720px]:items-stretch">
          <SearchBox value={query} onChange={handleSearch} />
          <span className="text-brand-muted">{filtered.length} tests</span>
        </div>
        {isLoading ? (
          <TableSkeleton rows={7} columns={6} />
        ) : error ? (
          <EmptyState title="Could not load tests" description={error} action={<Button size="sm" onClick={loadTests}>Retry</Button>} />
        ) : filtered.length ? (
          <>
            <DataTable
              columns={["Test name", "Subject", "Topics", "Status", "Created date", "Actions"]}
              rows={paginated.map((test) => [
                <strong>{test.name}</strong>,
                test.subject,
                <span>{test.topics.join(", ") || "No topics"}</span>,
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                    test.status === "Draft"
                      ? "bg-[#fff6df] text-[#935f00]"
                      : test.status === "Published"
                        ? "bg-[#f0edff] text-[#5b42b8]"
                        : test.status === "Ready"
                          ? "bg-[#eafaf4] text-[#087b52]"
                          : "bg-[#eff3ff] text-[#164ac0]"
                  }`}
                >
                  {test.displayStatus ?? test.status}
                </span>,
                test.createdAt,
                <div className="inline-flex items-center gap-2">
                  <IconLink to={`/tests/${test.id}/preview`} label={`View ${test.name}`}>
                    <Eye size={16} />
                  </IconLink>
                  <IconLink to={`/tests/${test.id}/edit`} label={`Edit ${test.name}`}>
                    <Edit2 size={16} />
                  </IconLink>
                  <IconButton label={`Delete ${test.name}`} tone="danger" onClick={() => setDeleteId(test.id)}>
                    <Trash2 size={16} />
                  </IconButton>
                </div>
              ])}
            />
            <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
          </>
        ) : (
          <EmptyState
            title="No tests found"
            description="Create a new test or adjust your search filter."
            action={<Button size="lg" onClick={() => navigate("/tests/new")}>Create New Test</Button>}
          />
        )}
      </Card>
      <Modal title="Delete test" open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <p className="text-brand-muted">This test and its questions will be removed from this workspace.</p>
        <div className="mt-6 flex items-center justify-end gap-3.5">
          <Button variant="secondary" size="lg" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button variant="danger" size="lg" onClick={remove}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};
