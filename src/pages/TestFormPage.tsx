import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { getApiErrorMessage } from "../api/client";
import { ApiSubject, ApiSubTopic, ApiTopic, toApiDifficulty, toApiType } from "../services/apiTypes";
import { subjectsService } from "../services/subjects.service";
import { testsService } from "../services/tests.service";
import { topicsService } from "../services/topics.service";
import { Difficulty, Test, TestType } from "../types";
import { useUnsavedChanges } from "../hooks/useUnsavedChanges";
import { Button, Card, EmptyState, FormError, FormSkeleton, Input, Select, SpinnerInput } from "../ui/components";
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
  const [reloadKey, setReloadKey] = useState(0);
  const railSet = useRailStore((s) => s.set);
  const railClear = useRailStore((s) => s.clear);
  const isHydratingEdit = useRef(false);
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty, isSubmitting },
    watch
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: toValues(existing) });
  const selectedType = watch("type");
  const selectedSubject = watch("subject");
  const selectedTopics = watch("topics");
  useUnsavedChanges(isDirty && !isSubmitting);

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
          railSet({ visible: true, totalQuestions: mapped.totalQuestions, doneCount: mapped.questionIds?.length ?? 0 });
        }
      } catch (error) {
        const message = getApiErrorMessage(error, "Unable to load test form data.") ?? "";
        setLoadError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
    return () => { railClear(); };
  }, [railClear, railSet, reloadKey, reset, testId]);

  useEffect(() => {
    if (!selectedSubject) {
      setTopics([]);
      setSubTopics([]);
      return;
    }
    const loadTopics = async () => {
      const isHydrating = isHydratingEdit.current;
      try {
        const topicList = await topicsService.bySubject(selectedSubject);
        setTopics(topicList);
        if (!isHydrating) {
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
      const isHydrating = isHydratingEdit.current;
      try {
        const subTopicList = await topicsService.subTopicsByTopics(selectedTopics);
        setSubTopics(subTopicList);
        if (!isHydrating) {
          setValue("subTopics", []);
        }
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Unable to load sub-topics."));
      } finally {
        if (isHydrating) {
          isHydratingEdit.current = false;
        }
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
      reset(values);
      toast.success("Draft saved");
      navigate("/dashboard");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to save draft."));
    }
  });

  const next = handleSubmit(async (values) => {
    try {
      const id = await persist(values, existing?.rawStatus ?? "draft");
      reset(values);
      toast.success("Test details saved");
      navigate(`/tests/${id}/questions`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to save test."));
    }
  });

  if (isLoading) return <div className="mx-auto grid w-full min-w-0 max-w-[1160px] gap-5"><p className="m-0 text-base text-[#666]">Test Creation / Create Test</p><FormSkeleton rows={8} /></div>;
  if (testId && !isLoading && loadError && !existing) {
    return (
      <div className="mx-auto grid w-full min-w-0 max-w-[1160px] gap-5">
        <p className="m-0 text-base text-[#666]">Test Creation / Create Test</p>
        <EmptyState
          title="Form data unavailable"
          description={loadError}
          action={<Button size="sm" onClick={() => setReloadKey((value) => value + 1)}>Retry</Button>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full min-w-0 max-w-[1160px] gap-5">
      <p className="m-0 text-base text-[#666]">Test Creation / Create Test / {selectedType}</p>
      {loadError && !isLoading ? (
        <EmptyState
          title="Some form data could not load"
          description={loadError}
          action={<Button size="sm" onClick={() => setReloadKey((value) => value + 1)}>Retry</Button>}
        />
      ) : null}
      <form className="grid gap-7" onSubmit={next}>
        <div className="flex w-fit gap-0 rounded-[7px] border border-brand-line p-1">
          {testTypes.map((type) => (
            <label
              key={type}
              className={`min-h-9 cursor-pointer rounded-[7px] border-0 bg-transparent px-5 py-2 text-sm font-medium text-[#9aa3b2] transition-colors duration-200 ${selectedType === type ? "bg-brand-secondary font-semibold text-brand-blue" : ""}`}
            >
              <input className="hidden" type="radio" value={type} {...register("type")} />
              {type}
            </label>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-x-12 gap-y-7 md:grid-cols-2">
          <Select label="Subject" options={subjectOptions} error={errors.subject?.message} {...register("subject")} />
          <Input label="Name of Test" placeholder="Enter name of Test" error={errors.name?.message} {...register("name")} />
          <Controller
            name="topics"
            control={control}
            render={({ field }) => (
              <Select
                label="Topic"
                value={field.value[0] ?? ""}
                onChange={(event) => field.onChange(event.target.value ? [event.target.value] : [])}
                options={topicOptions}
                error={errors.topics?.message}
              />
            )}
          />
          <Controller
            name="subTopics"
            control={control}
            render={({ field }) => (
              <Select
                label="Sub Topic"
                value={field.value[0] ?? ""}
                onChange={(event) => field.onChange(event.target.value ? [event.target.value] : [])}
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
          <Card className="grid content-start gap-7 border-0 p-0">
            <span>Test Difficulty Level</span>
            <div className="flex justify-between gap-5">
              {difficulties.map((difficulty) => (
                <label className="flex items-center gap-3" key={difficulty}>
                  <input type="radio" value={difficulty} {...register("difficulty")} />
                  {difficulty}
                </label>
              ))}
            </div>
          </Card>
        </div>
        <h2 className="m-0 text-[17px] font-bold">Marking Scheme:</h2>
        <div className="grid grid-cols-1 gap-7 min-[981px]:grid-cols-5 min-[721px]:grid-cols-2">
          <div className="relative grid gap-3 font-medium text-brand-ink">
            <span>Wrong Answer</span>
            <Controller name="wrongMarks" control={control} render={({ field }) => (
              <SpinnerInput value={Number(field.value)} onChange={field.onChange} max={0} />
            )} />
            <FormError message={errors.wrongMarks?.message} />
          </div>
          <div className="relative grid gap-3 font-medium text-brand-ink">
            <span>Unattempted</span>
            <Controller name="unattemptMarks" control={control} render={({ field }) => (
              <SpinnerInput value={Number(field.value)} onChange={field.onChange} />
            )} />
            <FormError message={errors.unattemptMarks?.message} />
          </div>
          <div className="relative grid gap-3 font-medium text-brand-ink">
            <span>Correct Answer</span>
            <Controller name="correctMarks" control={control} render={({ field }) => (
              <SpinnerInput value={Number(field.value)} onChange={field.onChange} min={0} />
            )} />
            <FormError message={errors.correctMarks?.message} />
          </div>
          <Input label="No of Questions" type="number" placeholder="Ex:250 Marks" error={errors.totalQuestions?.message} {...register("totalQuestions")} />
          <div className="relative grid gap-3 font-medium text-brand-ink">
            <span className="text-[#9aa3b2]">Total Marks</span>
            <Input label="" placeholder="Ex:250 Marks" type="number" error={errors.totalMarks?.message} {...register("totalMarks")} />
          </div>
        </div>
        <div className="mt-2.5 flex items-center justify-end gap-5 max-[720px]:flex-col max-[720px]:items-stretch">
          <Button variant="secondary" size="lg" type="button" onClick={saveDraft} isLoading={isSubmitting}>
            Cancel
          </Button>
          <Button size="lg" type="submit" isLoading={isSubmitting}>
            Next
          </Button>
        </div>
      </form>
    </div>
  );
};
