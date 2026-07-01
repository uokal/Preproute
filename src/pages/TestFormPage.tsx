import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { getApiErrorMessage } from "../api/client";
import { ApiSubject, ApiSubTopic, ApiTopic, toApiDifficulty, toApiType } from "../services/apiTypes";
import { subjectsService } from "../services/subjects.service";
import { testsService } from "../services/tests.service";
import { topicsService } from "../services/topics.service";
import { Difficulty, Test, TestType } from "../types";
import { Button, Card, EmptyState, FormError, Input, Loader, MultiSelect, Select, SpinnerInput } from "../ui/components";
import { useRailStore } from "../store/railStore";

const testTypes: TestType[] = ["Chapterwise", "PYQ", "Mock Test"];
const difficulties: Difficulty[] = ["Easy", "Medium", "Difficult"];

const schema = z.object({
  name: z.string().min(3, "Test name is required."),
  subject: z.string().min(1, "Select a subject."),
  type: z.enum(["Chapterwise", "PYQ", "Mock Test"]),
  topics: z.array(z.string()).min(1, "Select at least one topic."),
  subTopics: z.array(z.string()).min(1, "Select at least one sub-topic."),
  difficulty: z.enum(["Easy", "Medium", "Difficult"]),
  correctMarks: z.coerce.number().min(0, "Correct marks cannot be negative."),
  wrongMarks: z.coerce.number().max(0, "Wrong marks should be zero or negative."),
  unattemptMarks: z.coerce.number(),
  totalTime: z.coerce.number().min(1, "Enter total time."),
  totalMarks: z.coerce.number().min(1, "Enter total marks."),
  totalQuestions: z.coerce.number().min(1, "Enter total questions.")
});

type FormValues = z.infer<typeof schema>;

const toValues = (test?: Test): FormValues => ({
  name: test?.name ?? "",
  subject: test?.subject ?? "",
  type: test?.type ?? "Chapterwise",
  topics: test?.topics ?? [],
  subTopics: test?.subTopics ?? [],
  difficulty: test?.difficulty ?? "Easy",
  correctMarks: test?.correctMarks ?? 5,
  wrongMarks: test?.wrongMarks ?? -1,
  unattemptMarks: test?.unattemptMarks ?? 0,
  totalTime: test?.totalTime ?? 60,
  totalMarks: test?.totalMarks ?? 250,
  totalQuestions: test?.totalQuestions ?? 50
});

export const TestFormPage = () => {
  const navigate = useNavigate();
  const { testId } = useParams();
  const [existing, setExisting] = useState<Test | undefined>();
  const [subjects, setSubjects] = useState<ApiSubject[]>([]);
  const [topics, setTopics] = useState<ApiTopic[]>([]);
  const [subTopics, setSubTopics] = useState<ApiSubTopic[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(testId));
  const [loadError, setLoadError] = useState("");
  const railSet = useRailStore((s) => s.set);
  const railClear = useRailStore((s) => s.clear);
  const isHydratingEdit = useRef(false);
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
    watch
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: toValues(existing) });
  const selectedType = watch("type");
  const selectedSubject = watch("subject");
  const selectedTopics = watch("topics");

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setLoadError("");
      try {
        const subjectList = await subjectsService.list();
        setSubjects(subjectList);
        if (testId) {
          const apiTest = await testsService.get(testId);
          const subject = subjectList.find((item) => item.name === apiTest.subject);
          const topicList = subject ? await topicsService.bySubject(subject.id) : [];
          const selectedTopicIds = topicList.filter((item) => apiTest.topics?.includes(item.name)).map((item) => item.id);
          const subTopicList = selectedTopicIds.length ? await topicsService.subTopicsByTopics(selectedTopicIds) : [];
          const selectedSubTopicIds = subTopicList.filter((item) => apiTest.sub_topics?.includes(item.name)).map((item) => item.id);
          setTopics(topicList);
          setSubTopics(subTopicList);
          const mapped: Test = {
            id: apiTest.id,
            name: apiTest.name,
            subject: apiTest.subject,
            subjectId: subject?.id,
            type: apiTest.type === "pyq" ? "PYQ" : apiTest.type === "mock" ? "Mock Test" : "Chapterwise",
            topics: apiTest.topics ?? [],
            subTopics: apiTest.sub_topics ?? [],
            topicIds: selectedTopicIds,
            subTopicIds: selectedSubTopicIds,
            difficulty: apiTest.difficulty === "medium" ? "Medium" : apiTest.difficulty === "hard" ? "Difficult" : "Easy",
            correctMarks: apiTest.correct_marks,
            wrongMarks: apiTest.wrong_marks,
            unattemptMarks: apiTest.unattempt_marks,
            totalTime: apiTest.total_time,
            totalMarks: apiTest.total_marks,
            totalQuestions: apiTest.total_questions,
            status: apiTest.status === "live" ? "Published" : "Draft",
            createdAt: apiTest.created_at,
            questions: [],
            questionIds: Array.isArray(apiTest.questions)
              ? apiTest.questions.map((question) => (typeof question === "string" ? question : question.id))
              : []
          };
          setExisting(mapped);
          isHydratingEdit.current = true;
          reset({ ...toValues(mapped), subject: subject?.id ?? "", topics: selectedTopicIds, subTopics: selectedSubTopicIds });
          railSet({ totalQuestions: mapped.totalQuestions, doneCount: mapped.questionIds?.length ?? 0 });
          window.setTimeout(() => { isHydratingEdit.current = false; }, 0);
        }
      } catch (error) {
        const message = getApiErrorMessage(error, "Unable to load test form data.");
        setLoadError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
    return () => { railClear(); };
  }, [reset, testId]);

  useEffect(() => {
    if (!selectedSubject) {
      setTopics([]);
      setSubTopics([]);
      return;
    }
    const loadTopics = async () => {
      try {
        const topicList = await topicsService.bySubject(selectedSubject);
        setTopics(topicList);
        if (!isHydratingEdit.current) {
          setValue("topics", []);
          setValue("subTopics", []);
        }
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Unable to load topics."));
      }
    };
    void loadTopics();
  }, [selectedSubject, setValue]);

  useEffect(() => {
    const loadSubTopics = async () => {
      try {
        const subTopicList = await topicsService.subTopicsByTopics(selectedTopics);
        setSubTopics(subTopicList);
        if (!isHydratingEdit.current) {
          setValue("subTopics", []);
        }
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Unable to load sub-topics."));
      }
    };
    void loadSubTopics();
  }, [selectedTopics, setValue]);

  const subjectOptions = useMemo(() => subjects.map((subject) => ({ value: subject.id, label: subject.name })), [subjects]);
  const topicOptions = useMemo(() => topics.map((topic) => ({ value: topic.id, label: topic.name })), [topics]);
  const subTopicOptions = useMemo(() => subTopics.map((subTopic) => ({ value: subTopic.id, label: subTopic.name })), [subTopics]);

  const buildPayload = (values: FormValues, status: string | null) => {
    return {
      name: values.name,
      type: toApiType(values.type),
      subject: values.subject,
      topics: values.topics,
      sub_topics: values.subTopics,
      correct_marks: values.correctMarks,
      wrong_marks: values.wrongMarks,
      unattempt_marks: values.unattemptMarks,
      difficulty: toApiDifficulty(values.difficulty),
      total_time: values.totalTime,
      total_marks: values.totalMarks,
      total_questions: values.totalQuestions,
      status
    };
  };

  const persist = async (values: FormValues, status: string | null) => {
    const payload = buildPayload(values, status);
    const saved = testId ? await testsService.update(testId, payload) : await testsService.create(payload);
    return saved.id;
  };

  const saveDraft = handleSubmit(async (values) => {
    try {
      await persist(values, "draft");
      toast.success("Draft saved");
      navigate("/dashboard");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to save draft."));
    }
  });

  const next = handleSubmit(async (values) => {
    try {
      const id = await persist(values, existing?.rawStatus ?? "draft");
      toast.success("Test details saved");
      navigate(`/tests/${id}/questions`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to save test."));
    }
  });

  if (testId && !isLoading && loadError && !existing) return <Navigate to="/dashboard" replace />;

  return (
    <div className="page">
      <p className="breadcrumb">Test Creation / Create Test / {selectedType}</p>
      {isLoading ? <Loader label="Loading form data" /> : null}
      {loadError && !isLoading ? <EmptyState title="Form data unavailable" description={loadError} /> : null}
      <form className="test-form" onSubmit={next}>
        <div className="segmented">
          {testTypes.map((type) => (
            <label key={type} className={selectedType === type ? "active" : ""}>
              <input type="radio" value={type} {...register("type")} />
              {type}
            </label>
          ))}
        </div>
        <div className="form-grid">
          <Select label="Subject" options={subjectOptions} error={errors.subject?.message} {...register("subject")} />
          <Input label="Name of Test" placeholder="Enter name of Test" error={errors.name?.message} {...register("name")} />
          <Controller
            name="topics"
            control={control}
            render={({ field }) => (
              <MultiSelect label="Topic" value={field.value} onChange={field.onChange} options={topicOptions} error={errors.topics?.message} />
            )}
          />
          <Controller
            name="subTopics"
            control={control}
            render={({ field }) => (
              <MultiSelect
                label="Sub Topic"
                value={field.value}
                onChange={field.onChange}
                options={subTopicOptions}
                error={errors.subTopics?.message}
              />
            )}
          />
          <Input
            label="Duration (Minutes)"
            type="number"
            placeholder="Enter the time"
            error={errors.totalTime?.message}
            {...register("totalTime")}
          />
          <Card className="difficulty-card">
            <span>Test Difficulty Level</span>
            <div className="radio-row">
              {difficulties.map((difficulty) => (
                <label key={difficulty}>
                  <input type="radio" value={difficulty} {...register("difficulty")} />
                  {difficulty}
                </label>
              ))}
            </div>
          </Card>
        </div>
        <h2 className="section-title">Marking Scheme:</h2>
        <div className="marking-grid">
          <div className="field">
            <span>Wrong Answer</span>
            <Controller name="wrongMarks" control={control} render={({ field }) => (
              <SpinnerInput value={Number(field.value)} onChange={field.onChange} max={0} />
            )} />
            <FormError message={errors.wrongMarks?.message} />
          </div>
          <div className="field">
            <span>Unattempted</span>
            <Controller name="unattemptMarks" control={control} render={({ field }) => (
              <SpinnerInput value={Number(field.value)} onChange={field.onChange} />
            )} />
            <FormError message={errors.unattemptMarks?.message} />
          </div>
          <div className="field">
            <span>Correct Answer</span>
            <Controller name="correctMarks" control={control} render={({ field }) => (
              <SpinnerInput value={Number(field.value)} onChange={field.onChange} min={0} />
            )} />
            <FormError message={errors.correctMarks?.message} />
          </div>
          <Input label="No of Questions" type="number" placeholder="Ex:250 Marks" error={errors.totalQuestions?.message} {...register("totalQuestions")} />
          <div className="field">
            <span className="text-[#9aa3b2]">Total Marks</span>
            <Input label="" placeholder="Ex:250 Marks" type="number" error={errors.totalMarks?.message} {...register("totalMarks")} />
          </div>
        </div>
        <div className="form-actions">
          <Button variant="secondary" size="lg" type="button" onClick={saveDraft} isLoading={isSubmitting}>
            Save as Draft
          </Button>
          <Button size="lg" type="submit" isLoading={isSubmitting}>
            Next: Add Questions
          </Button>
        </div>
      </form>
    </div>
  );
};
