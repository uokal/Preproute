import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../api/client";
import { mapApiTest } from "../services/apiTypes";
import { questionsService } from "../services/questions.service";
import { testsService } from "../services/tests.service";
import { Test } from "../types";
import { Button, Card, DateInput, DetailSkeleton, EmptyState, RadioOption, SegmentedControl, TestSummaryCard, TimeSelect } from "../ui/components";
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
  const [isPublishing, setIsPublishing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
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
        railSet({ visible: true, totalQuestions: mapped.totalQuestions, doneCount: questions.length });
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
  }, [railClear, railSet, reloadKey, testId]);

  if (!testId) return <Navigate to="/dashboard" replace />;
  if (isLoading) return <div className="mx-auto grid w-full min-w-0 max-w-[1160px] gap-5"><DetailSkeleton /><DetailSkeleton /></div>;
  if (!test) {
    return (
      <div className="mx-auto grid w-full min-w-0 max-w-[1160px] gap-5">
        <EmptyState
          title="Could not load preview"
          description={loadError || "The selected test was not found."}
          action={<Button size="sm" onClick={() => setReloadKey((value) => value + 1)}>Retry</Button>}
        />
      </div>
    );
  }

  const publish = async () => {
    const previous = test;
    setIsPublishing(true);
    setTest({ ...test, status: "Published", rawStatus: "live", displayStatus: "Live", publishMode: mode, liveUntil });
    try {
      await testsService.update(test.id, { status: "live" });
      setSuccess(true);
      toast.success("Test published successfully");
      navigate("/dashboard");
    } catch (error) {
      setTest(previous);
      toast.error(getApiErrorMessage(error, "Unable to publish test."));
    } finally {
      setIsPublishing(false);
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
    <div className="mx-auto grid w-full min-w-0 max-w-[1160px] gap-5 pb-7">
        <p className="m-0 text-base text-[#666]">Test creation</p>
        {success ? (
          <div className="flex items-center gap-2.5 rounded-[7px] bg-[#eafaf4] px-3.5 py-3 font-semibold text-[#087b52]">
            <CheckCircle2 size={20} />
            Test published successfully. The published output is ready below.
          </div>
        ) : null}
        <div className="flex items-center gap-4">
          <h1 className="text-[17px] font-bold">Test created</h1>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#63cba3] px-3 py-1 text-[13px] text-[#079e69]">
            <CheckCircle2 size={14} />
            All {test.totalQuestions} Questions done
          </span>
        </div>
        <TestSummaryCard test={test} onEdit={() => navigate(`/tests/${test.id}/edit`)} />
        <Card className="grid gap-5">
          <div className="flex items-center justify-between gap-4 max-[720px]:flex-col max-[720px]:items-start">
            <h2 className="m-0 text-[17px] font-bold">Question Preview</h2>
            <span className="rounded-full bg-brand-secondary px-3 py-1 text-sm font-semibold text-brand-secondaryText">
              {test.questions.length}/{test.totalQuestions} MCQ
            </span>
          </div>
          {test.questions.length ? (
            <div className="grid gap-4">
              {test.questions.map((question, questionIndex) => (
                <article key={question.id} className="grid gap-4 rounded-[7px] border border-brand-line bg-white p-4">
                  <div className="flex items-start justify-between gap-4 max-[720px]:flex-col">
                    <div className="grid gap-2">
                      <p className="m-0 text-sm font-semibold text-brand-blue">Question {questionIndex + 1}</p>
                      <h3 className="m-0 text-base font-semibold text-brand-ink">{question.text}</h3>
                    </div>
                    <span className="rounded-full bg-[#ecfffa] px-3 py-1 text-sm font-medium text-[#079e69]">{question.difficulty}</span>
                  </div>
                  {question.mediaUrl ? (
                    <img
                      className="max-h-64 w-full rounded-[7px] border border-brand-line object-contain"
                      src={question.mediaUrl}
                      alt={`Question ${questionIndex + 1} attachment`}
                    />
                  ) : null}
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={`${question.id}-${optionIndex}`}
                        className={`rounded-[7px] border px-4 py-3 text-sm ${
                          question.correctOption === optionIndex
                            ? "border-[#63cba3] bg-[#f8fffc] font-semibold text-[#087b52]"
                            : "border-brand-line bg-brand-secondary/40 text-brand-ink"
                        }`}
                      >
                        {String.fromCharCode(65 + optionIndex)}. {option}
                      </div>
                    ))}
                  </div>
                  <div className="rounded-[7px] bg-brand-secondary p-4 text-sm text-brand-muted">
                    <span className="font-semibold text-brand-ink">Solution: </span>
                    {question.explanation}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="No questions added" description="Add questions before publishing this test." />
          )}
        </Card>
        <div className="grid gap-5 rounded-[7px] border border-brand-line bg-white p-6">
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
              <h2 className="m-0 text-[17px] font-bold">Select Date and Time</h2>
              <div className="grid grid-cols-1 gap-x-12 gap-y-7 md:grid-cols-2">
                <DateInput placeholder="Select Date" value={scheduleDate} onChange={setScheduleDate} />
                <TimeSelect placeholder="Select Time" value={scheduleTime} onChange={setScheduleTime} />
              </div>
            </>
          ) : null}
          <h2 className="m-0 text-[17px] font-bold">Live Until</h2>
          <p className="text-brand-muted">Choose how long this test should remain available on the platform.</p>
          <div className="grid grid-cols-1 gap-x-20 gap-y-6 md:grid-cols-2">
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
            <div className="grid grid-cols-1 gap-x-12 gap-y-7 md:grid-cols-2">
              <DateInput placeholder="Select End Date" value={endDate} onChange={setEndDate} />
              <TimeSelect placeholder="Select End Time" value={endTime} onChange={setEndTime} />
            </div>
          ) : null}
          <div className="mt-2.5 flex items-center justify-end gap-5 max-[720px]:flex-col max-[720px]:items-stretch">
            <Button variant="secondary" size="lg" onClick={() => navigate("/dashboard")}>
              Cancel
            </Button>
            <Button size="lg" variant="primary" onClick={publish} disabled={!test.questions.length} isLoading={isPublishing}>
              Confirm
            </Button>
          </div>
        </div>
    </div>
  );
};
