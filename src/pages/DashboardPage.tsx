import { useEffect, useMemo, useState } from "react";
import { Edit2, Eye, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../api/client";
import { testsService } from "../services/tests.service";
import { Test } from "../types";
import { Button, Card, DataTable, EmptyState, IconButton, IconLink, Loader, Modal, Pagination, SearchBox } from "../ui/components";

const PAGE_SIZE = 10;

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState<Test[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTests = async () => {
    setIsLoading(true);
    setError("");
    try {
      setTests(await testsService.list());
    } catch (loadError) {
      const message = getApiErrorMessage(loadError, "Unable to load tests.");
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void loadTests(); }, []);

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
    try {
      await testsService.remove(deleteId);
      setTests((current) => current.filter((test) => test.id !== deleteId));
      setDeleteId(null);
      toast.success("Test deleted");
    } catch (deleteError) {
      toast.error(getApiErrorMessage(deleteError, "Unable to delete test."));
    }
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="breadcrumb">Test Creation / Dashboard</p>
          <h1>Test List</h1>
        </div>
        <Button size="lg" onClick={() => navigate("/tests/new")}>
          <Plus size={17} />
          Create New Test
        </Button>
      </div>
      <Card>
        <div className="toolbar">
          <SearchBox value={query} onChange={handleSearch} />
          <span className="muted">{filtered.length} tests</span>
        </div>
        {isLoading ? (
          <Loader label="Loading tests" />
        ) : error ? (
          <EmptyState title="Could not load tests" description={error} action={<Button size="sm" onClick={loadTests}>Try again</Button>} />
        ) : filtered.length ? (
          <>
            <DataTable
              columns={["Test name", "Subject", "Topics", "Status", "Created date", "Actions"]}
              rows={paginated.map((test) => [
                <strong>{test.name}</strong>,
                test.subject,
                <span>{test.topics.join(", ") || "No topics"}</span>,
                <span className={`status status-${test.status.toLowerCase()}`}>{test.displayStatus ?? test.status}</span>,
                test.createdAt,
                <div className="row-actions">
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
        <p className="muted">This test and its questions will be removed from this workspace.</p>
        <div className="modal-actions">
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
