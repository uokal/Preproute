import { zodResolver } from "@hookform/resolvers/zod";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { getApiErrorMessage } from "../api/client";
import { mapApiTest } from "../services/apiTypes";
import { questionToBulkPayload, questionsService } from "../services/questions.service";
import { subjectsService } from "../services/subjects.service";
import { testsService } from "../services/tests.service";
import { Difficulty, Question } from "../types";
import { Button, Card, EmptyState, IconButton, Input, Loader, Select, TestSummaryCard } from "../ui/components";
import { useRailStore } from "../store/railStore";

const schema = z.object({
  text: z.string().min(8, "Question text is required."),
  optionA: z.string().min(1, "Option 1 is required."),
  optionB: z.string().min(1, "Option 2 is required."),
  optionC: z.string().min(1, "Option 3 is required."),
  optionD: z.string().min(1, "Option 4 is required."),
  correctOption: z.coerce.number().min(0).max(3),
  explanation: z.string().min(4, "Add a short explanation."),
  difficulty: z.enum(["Easy", "Medium", "Difficult"]),
  topic: z.string().min(1, "Select topic."),
  subTopic: z.string().min(1, "Select sub-topic."),
  mediaUrl: z.string().url("Enter a valid URL.").optional().or(z.literal(""))
});

type QuestionValues = z.infer<typeof schema>;

const defaults: QuestionValues = {
  text: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctOption: 0,
  explanation: "",
  difficulty: "Easy",
  topic: "",
  subTopic: "",
  mediaUrl: ""
};

export const QuestionsPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState<import("../types").Test | undefined>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editing, setEditing] = useState<Question | null>(null);
  const [listError, setListError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const railSet = useRailStore((s) => s.set);
  const railClear = useRailStore((s) => s.clear);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<QuestionValues>({ resolver: zodResolver(schema), defaultValues: defaults });

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
        const [fetchedQuestions, subjectList] = await Promise.all([questionsService.fetchBulk(questionIds), subjectsService.list()]);
        const mappedTest = mapApiTest(apiTest, fetchedQuestions);
        const subject = subjectList.find((item) => item.id === apiTest.subject || item.name === apiTest.subject);
        setTest({ ...mappedTest, subjectId: subject?.id ?? mappedTest.subjectId });
        setQuestions(fetchedQuestions);
        railSet({ visible: true, totalQuestions: mappedTest.totalQuestions, doneCount: fetchedQuestions.length });
      } catch (error) {
        const message = getApiErrorMessage(error, "Unable to load test questions.");
        setLoadError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
    return () => { railClear(); };
  }, [testId]);

  if (!testId) return <Navigate to="/dashboard" replace />;
  if (isLoading) return <div className="page"><Loader label="Loading questions" /></div>;
  if (!test) return <div className="page"><EmptyState title="Could not load test" description={loadError || "The selected test was not found."} /></div>;

  const refreshCount = (nextQuestions: Question[]) => {
    setQuestions(nextQuestions);
    setTest((current) => (current ? { ...current, questions: nextQuestions } : current));
    railSet({ doneCount: nextQuestions.length });
  };

  const editQuestion = (question: Question) => {
    setEditing(question);
    reset({
      text: question.text,
      optionA: question.options[0],
      optionB: question.options[1],
      optionC: question.options[2],
      optionD: question.options[3],
      correctOption: question.correctOption,
      explanation: question.explanation,
      difficulty: question.difficulty,
      topic: question.topic,
      subTopic: question.subTopic,
      mediaUrl: question.mediaUrl ?? ""
    });
  };

  const submitQuestion = handleSubmit(async (values) => {
    const question: Question = {
      id:
        editing?.id && editing.id.startsWith("temp-")
          ? editing.id
          : `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      text: values.text,
      options: [values.optionA, values.optionB, values.optionC, values.optionD],
      correctOption: values.correctOption,
      explanation: values.explanation,
      difficulty: values.difficulty as Difficulty,
      topic: values.topic,
      subTopic: values.subTopic,
      mediaUrl: values.mediaUrl || undefined
    };
    const nextQuestions = editing
      ? questions.map((item) => (item.id === editing.id ? question : item))
      : [question, ...questions];
    refreshCount(nextQuestions);
    toast.success(editing ? "Question updated" : "Question added");
    setEditing(null);
    setListError("");
    reset(defaults);
  });

  const continueToPreview = async () => {
    if (!questions.length) {
      setListError("Add at least 1 question before continuing.");
      toast.error("Add at least 1 question");
      return;
    }
    try {
      const existingIds = questions.filter((question) => !question.id.startsWith("temp-")).map((question) => question.id);
      const newQuestions = questions.filter((question) => question.id.startsWith("temp-"));
      const subjectId = test.subjectId;
      if (!subjectId) {
        throw new Error("Subject ID is missing for this test. Please re-save test details before adding questions.");
      }
      const createdQuestions = newQuestions.length
        ? await questionsService.bulkCreate({ questions: newQuestions.map((question) => questionToBulkPayload(question, test.id, subjectId)) })
        : [];
      const questionIds = [...existingIds, ...createdQuestions.map((question) => question.id)];
      await testsService.update(test.id, { questions: questionIds, status: "unpublished" });
      toast.success("Questions saved");
      navigate(`/tests/${test.id}/preview`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to save questions."));
    }
  };

  return (
    <div className="page question-page">
      <div className="page-head compact-head">
        <p className="breadcrumb">Test Creation / Create Test / {test.type}</p>
        <Button size="lg" type="button" onClick={() => navigate(`/tests/${test.id}/preview`)}>
          Publish
        </Button>
      </div>
      <TestSummaryCard test={test} onEdit={() => navigate(`/tests/${test.id}/edit`)} />
      <div className="question-head">
        <h1>
          Question <span>{questions.length + 1}/{test.totalQuestions}</span>
        </h1>
        <div>
          <Button variant="secondary" type="button">
            <Plus size={16} /> MCQ
          </Button>
        </div>
      </div>
      <form className="question-form" onSubmit={submitQuestion}>
        <label className="field">
          <span>Question text</span>
          <textarea className={`control editor ${errors.text ? "control-error" : ""}`} placeholder="Type here" {...register("text")} />
          {errors.text ? <small className="form-error">{errors.text.message}</small> : null}
        </label>
        <div className="options-list">
          {[0, 1, 2, 3].map((index) => {
            const key = ["optionA", "optionB", "optionC", "optionD"][index] as keyof QuestionValues;
            return (
              <label className="option-row" key={key}>
                <input type="radio" value={index} {...register("correctOption")} />
                <input className="control" placeholder="Type Option here" {...register(key)} />
              </label>
            );
          })}
        </div>
        <label className="field">
          <span>Add Solution</span>
          <textarea className={`control solution ${errors.explanation ? "control-error" : ""}`} placeholder="Type here" {...register("explanation")} />
          {errors.explanation ? <small className="form-error">{errors.explanation.message}</small> : null}
        </label>
        <div className="form-grid">
          <Select label="Level of Difficulty" options={["Easy", "Medium", "Difficult"]} error={errors.difficulty?.message} {...register("difficulty")} />
          <Select label="Topic" options={test.topics} error={errors.topic?.message} {...register("topic")} />
          <Select label="Sub-topic" options={test.subTopics} error={errors.subTopic?.message} {...register("subTopic")} />
          <Input label="Media URL" placeholder="https://example.com/image.png" error={errors.mediaUrl?.message} {...register("mediaUrl")} />
        </div>
        <div className="form-actions spread">
          <Button variant="danger" size="lg" type="button" onClick={() => navigate("/dashboard")}>
            Exit Test Creation
          </Button>
          <div className="right-actions">
            <Button variant="secondary" size="lg" type="submit" isLoading={isSubmitting}>
              {editing ? "Update Question" : "Add Another Question"}
            </Button>
            <Button size="lg" type="button" onClick={continueToPreview}>
              Save & Continue
            </Button>
          </div>
        </div>
        {listError ? <div className="error-banner">{listError}</div> : null}
      </form>
      <Card>
        <h2 className="section-title">Added questions</h2>
        {questions.length ? (
          <div className="added-list">
            {questions.map((question, index) => (
              <div className="added-question" key={question.id}>
                <div>
                  <strong>{index + 1}. {question.text}</strong>
                  <p>{question.topic} / {question.subTopic}</p>
                </div>
                <div className="row-actions">
                  <IconButton label={`Edit question ${index + 1}`} onClick={() => editQuestion(question)}>
                    <Edit2 size={16} />
                  </IconButton>
                  <IconButton
                    label={`Remove question ${index + 1}`}
                    tone="danger"
                    onClick={() => {
                      refreshCount(questions.filter((item) => item.id !== question.id));
                      toast.success("Question deleted");
                    }}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No questions yet" description="Add at least one MCQ question to unlock preview and publish." />
        )}
      </Card>
      <Link className="text-link" to={`/tests/${test.id}/edit`}>
        Edit test details
      </Link>
    </div>
  );
};
