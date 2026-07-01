import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../api/client";
import { mapApiTest } from "../services/apiTypes";
import { questionsService } from "../services/questions.service";
import { testsService } from "../services/tests.service";
import { Test } from "../types";
import { Button, DateInput, EmptyState, Loader, RadioOption, SegmentedControl, TestSummaryCard, TimeSelect } from "../ui/components";
import { useRailStore } from "../store/railStore";

export const PreviewPublishPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState<Test | undefined>();
  const [mode, setMode] = useState<"now" | "schedule">("now");
  const [liveUntil, setLiveUntil] = useState("custom duration");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const railSet = useRailStore((s) => s.set);
  const railClear = useRailStore((s) => s.clear);

  useEffect(() => {
    const load = async () => {
      if (!testId) return;
      setIsLoading(true);
      setLoadError("");
      try {
        const apiTest = await testsService.get(testId);
        const questionIds = Array.isArray(apiTest.questions)
          ? apiTest.questions.map((question) => (typeof question === "string" ? question : question.id))
          : [];
        const questions = await questionsService.fetchBulk(questionIds);
        const mapped = mapApiTest(apiTest, questions);
        setTest(mapped);
        railSet({ totalQuestions: mapped.totalQuestions, doneCount: questions.length });
      } catch (error) {
        const message = getApiErrorMessage(error, "Unable to load preview.");
        setLoadError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
    return () => { railClear(); };
  }, [testId]);

  useEffect(() => {
    if (!success) return;
    const timer = window.setTimeout(() => navigate("/dashboard"), 1500);
    return () => window.clearTimeout(timer);
  }, [navigate, success]);

  if (!testId) return <Navigate to="/dashboard" replace />;
  if (isLoading) return <div className="page"><Loader label="Loading preview" /></div>;
  if (!test) return <div className="page"><EmptyState title="Could not load preview" description={loadError || "The selected test was not found."} /></div>;

  const publish = async () => {
    try {
      await testsService.update(test.id, { status: "live" });
      setTest({ ...test, status: "Published", rawStatus: "live", displayStatus: "Live", publishMode: mode, liveUntil });
      setSuccess(true);
      toast.success("Test published successfully");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to publish test."));
    }
  };

  const liveOptions = [
    { value: "always available", label: "Always Available" },
    { value: "1 week", label: "1 Week" },
    { value: "2 weeks", label: "2 Weeks" },
    { value: "3 weeks", label: "3 Weeks" },
    { value: "1 month", label: "1 Month" },
    { value: "custom duration", label: "Custom Duration" },
  ];

  return (
    <div className="page publish-page">
        <p className="breadcrumb">Test creation</p>
        {success ? (
          <div className="success-banner">
            <CheckCircle2 size={20} />
            Test published successfully. Redirecting to dashboard...
          </div>
        ) : null}
        <div className="created-row">
          <h1>Test created</h1>
          <span className="done-pill">
            <CheckCircle2 size={14} />
            All {test.totalQuestions} Questions done
          </span>
        </div>
        <TestSummaryCard test={test} onEdit={() => navigate(`/tests/${test.id}/edit`)} />
        <div className="publish-settings">
          <SegmentedControl
            ariaLabel="Publish mode"
            value={mode}
            onChange={setMode}
            options={[
              { value: "now", label: "Publish Now" },
              { value: "schedule", label: "Schedule Publish" }
            ]}
          />
          {mode === "schedule" ? (
            <>
              <h2 className="section-title">Select Date and Time</h2>
              <div className="form-grid">
                <DateInput placeholder="Select Date" value={scheduleDate} onChange={setScheduleDate} />
                <TimeSelect placeholder="Select Time" value={scheduleTime} onChange={setScheduleTime} />
              </div>
            </>
          ) : null}
          <h2 className="section-title">Live Until</h2>
          <p className="muted">Choose how long this test should remain available on the platform.</p>
          <div className="radio-grid">
            {liveOptions.map((opt) => (
              <RadioOption
                key={opt.value}
                name="liveUntil"
                value={opt.value}
                checked={liveUntil === opt.value}
                onChange={() => setLiveUntil(opt.value)}
                label={opt.label}
              />
            ))}
          </div>
          {liveUntil === "custom duration" ? (
            <div className="form-grid">
              <DateInput placeholder="Select End Date" value={endDate} onChange={setEndDate} />
              <TimeSelect placeholder="Select End Time" value={endTime} onChange={setEndTime} />
            </div>
          ) : null}
          <div className="form-actions spread">
            <Button variant="ghost" size="lg" onClick={() => navigate("/dashboard")}>
              Cancel
            </Button>
            <Button size="lg" onClick={publish} disabled={!test.questions.length}>
              Confirm
            </Button>
          </div>
        </div>
    </div>
  );
};
