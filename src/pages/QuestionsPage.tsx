import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronLeft,
  ChevronRight,
  Download,
  Image,
  Italic,
  Link2,
  List,
  Plus,
  Sigma,
  Square,
  Trash2,
  Underline
} from "lucide-react";
import type { ChangeEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { getApiErrorMessage } from "../api/client";
import { useUnsavedChanges } from "../hooks/useUnsavedChanges";
import { mapApiTest } from "../services/apiTypes";
import { questionToBulkPayload, questionsService } from "../services/questions.service";
import { subjectsService } from "../services/subjects.service";
import { testsService } from "../services/tests.service";
import { Difficulty, Question } from "../types";
import { Button, DetailSkeleton, EmptyState, FormSkeleton, Input, Select, TestSummaryCard } from "../ui/components";
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

const getRailQuestionCount = (questionCount: number) => Math.max(6, questionCount);

const parseCsv = (content: string) => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    const nextCharacter = content[index + 1];

    if (character === "\"" && inQuotes && nextCharacter === "\"") {
      cell += "\"";
      index += 1;
      continue;
    }

    if (character === "\"") {
      inQuotes = !inQuotes;
      continue;
    }

    if (character === "," && !inQuotes) {
      row.push(cell.trim());
      cell = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !inQuotes) {
      if (character === "\r" && nextCharacter === "\n") index += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += character;
  }

  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
};

const normalizeHeader = (value: string) => value.trim().toLowerCase().replace(/[\s_-]+/g, "");

const pickCsvValue = (row: Record<string, string>, keys: string[]) => {
  for (const key of keys) {
    const value = row[normalizeHeader(key)];
    if (value) return value;
  }
  return "";
};

const normalizeDifficulty = (value: string): Difficulty => {
  const normalized = value.trim().toLowerCase();
  if (normalized === "medium") return "Medium";
  if (normalized === "hard" || normalized === "difficult") return "Difficult";
  return "Easy";
};

const normalizeCorrectOption = (value: string) => {
  const normalized = value.trim().toLowerCase().replace(/\s/g, "");
  if (["2", "b", "option2", "optionb"].includes(normalized)) return 1;
  if (["3", "c", "option3", "optionc"].includes(normalized)) return 2;
  if (["4", "d", "option4", "optiond"].includes(normalized)) return 3;
  return 0;
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
  const [reloadKey, setReloadKey] = useState(0);
  const savedQuestionSignature = useRef("");
  const csvInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement | null>(null);
  const railSet = useRailStore((s) => s.set);
  const railClear = useRailStore((s) => s.clear);
  const railAddQuestion = useRailStore((s) => s.addQuestion);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    setFocus,
    formState: { errors, isDirty, isSubmitting }
  } = useForm<QuestionValues>({ resolver: zodResolver(schema), defaultValues: defaults });

  const mediaRegister = register("mediaUrl");

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
        savedQuestionSignature.current = fetchedQuestions.map((question) => question.id).join("|");
        railSet({ visible: true, totalQuestions: getRailQuestionCount(fetchedQuestions.length), doneCount: fetchedQuestions.length });
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
  }, [railClear, railSet, reloadKey, testId]);

  const questionSignature = useMemo(() => questions.map((question) => question.id).join("|"), [questions]);
  const confirmNavigation = useUnsavedChanges((isDirty || questionSignature !== savedQuestionSignature.current) && !isSubmitting);

  if (!testId) return <Navigate to="/dashboard" replace />;
  if (isLoading) return <div className="mx-auto grid w-full min-w-0 max-w-[1160px] gap-5"><DetailSkeleton /><FormSkeleton rows={5} /></div>;
  if (!test) {
    return (
      <div className="mx-auto grid w-full min-w-0 max-w-[1160px] gap-5">
        <EmptyState
          title="Could not load test"
          description={loadError || "The selected test was not found."}
          action={<Button size="sm" onClick={() => setReloadKey((value) => value + 1)}>Retry</Button>}
        />
      </div>
    );
  }

  const refreshCount = (nextQuestions: Question[]) => {
    setQuestions(nextQuestions);
    setTest((current) => (current ? { ...current, questions: nextQuestions } : current));
    railSet({ totalQuestions: getRailQuestionCount(nextQuestions.length), doneCount: nextQuestions.length });
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
      : [...questions, question];
    if (!editing) {
      setQuestions(nextQuestions);
      setTest((current) => (current ? { ...current, questions: nextQuestions } : current));
      railAddQuestion();
    } else {
      refreshCount(nextQuestions);
    }
    toast.success(editing ? "Question updated" : "Question added");
    setEditing(null);
    setListError("");
    reset(defaults);
  });

  const clearCurrentEdits = () => {
    reset(defaults);
    setEditing(null);
    setListError("");
  };

  const applyFormat = (prefix: string, suffix = prefix, fallback = "formatted text") => {
    const current = getValues("text");
    const next = current ? `${current}\n${prefix}${fallback}${suffix}` : `${prefix}${fallback}${suffix}`;
    setValue("text", next, { shouldDirty: true, shouldValidate: true });
    setFocus("text");
  };

  const handleCsvUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const csv = await file.text();
      const [headerRow, ...dataRows] = parseCsv(csv);
      if (!headerRow || !dataRows.length) {
        toast.error("CSV file is empty.");
        return;
      }

      const headers = headerRow.map(normalizeHeader);
      const importedQuestions = dataRows
        .map((dataRow, rowIndex): Question | null => {
          const row = headers.reduce<Record<string, string>>((accumulator, header, index) => {
            accumulator[header] = dataRow[index] ?? "";
            return accumulator;
          }, {});
          const text = pickCsvValue(row, ["question", "text"]);
          const optionA = pickCsvValue(row, ["option1", "optionA", "a"]);
          const optionB = pickCsvValue(row, ["option2", "optionB", "b"]);
          const optionC = pickCsvValue(row, ["option3", "optionC", "c"]);
          const optionD = pickCsvValue(row, ["option4", "optionD", "d"]);
          const explanation = pickCsvValue(row, ["explanation", "solution", "answerExplanation"]);
          if (![text, optionA, optionB, optionC, optionD, explanation].every(Boolean)) return null;
          const mediaUrl = pickCsvValue(row, ["mediaUrl", "media_url", "image", "imageUrl"]);

          const question: Question = {
            id: `temp-csv-${Date.now()}-${rowIndex}`,
            text,
            options: [optionA, optionB, optionC, optionD],
            correctOption: normalizeCorrectOption(pickCsvValue(row, ["correctOption", "correct", "answer"])),
            explanation,
            difficulty: normalizeDifficulty(pickCsvValue(row, ["difficulty", "level"])),
            topic: pickCsvValue(row, ["topic"]) || test?.topics[0] || "",
            subTopic: pickCsvValue(row, ["subTopic", "sub_topic", "subtopic"]) || test?.subTopics[0] || ""
          };
          if (mediaUrl) question.mediaUrl = mediaUrl;
          return question;
        })
        .filter((question): question is Question => Boolean(question));

      if (!importedQuestions.length) {
        toast.error("No valid MCQ rows found in CSV.");
        return;
      }

      refreshCount([...questions, ...importedQuestions]);
      setListError("");
      toast.success(`${importedQuestions.length} question${importedQuestions.length > 1 ? "s" : ""} imported`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to import CSV."));
    }
  };

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
      savedQuestionSignature.current = questionIds.join("|");
      toast.success("Questions saved");
      navigate(`/tests/${test.id}/preview`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to save questions."));
    }
  };

  return (
    <div className="mx-auto grid w-full min-w-0 max-w-[1160px] gap-5 pb-7">
      <div className="flex items-center justify-between gap-4 max-[720px]:flex-col max-[720px]:items-stretch">
        <p className="m-0 text-base text-[#666]">Test Creation / Create Test / {test.type}</p>
        <Button size="lg" type="button" onClick={() => confirmNavigation(() => navigate(`/tests/${test.id}/preview`))}>
          Publish
        </Button>
      </div>
      <TestSummaryCard test={test} onEdit={() => navigate(`/tests/${test.id}/edit`)} />
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[17px] font-bold">
          Question <span className="text-[#8aa4ff]">{questions.length}/{test.totalQuestions}</span>
        </h1>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" type="submit" form="question-form">
            <Plus size={16} /> MCQ
          </Button>
          <Button variant="secondary" size="sm" type="button" onClick={() => csvInputRef.current?.click()}>
            <Download size={15} /> CSV
          </Button>
          <input ref={csvInputRef} className="sr-only" type="file" accept=".csv,text/csv" onChange={handleCsvUpload} aria-label="Upload CSV questions" />
        </div>
      </div>
      <form id="question-form" className="grid gap-6" onSubmit={submitQuestion}>
        {listError ? (
          <div className="rounded-[7px] border border-brand-danger/40 bg-[#fff8f8] px-4 py-3 text-sm font-semibold text-brand-danger" role="alert">
            {listError}
          </div>
        ) : null}
        <div className="flex items-center">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-[7px] bg-[#fff8f8] px-2 py-1 text-sm font-medium text-brand-danger transition-colors duration-200 hover:bg-[#fff0f0]"
            onClick={clearCurrentEdits}
          >
            <Trash2 size={16} />
            Delete All Edits
          </button>
        </div>

        <div className="relative grid font-medium text-brand-ink">
          <div className={`overflow-hidden rounded-[7px] border bg-white ${errors.text ? "border-[#ff7b86]" : "border-[#cbd2dc]"}`}>
            <div className="flex min-h-10 items-center gap-2 border-b border-[#edf0f5] px-4 text-[#8d95a6]">
              {[
                { icon: Italic, label: "Italic", onClick: () => applyFormat("_", "_") },
                { icon: Bold, label: "Bold", onClick: () => applyFormat("**", "**") },
                { icon: Underline, label: "Underline", onClick: () => applyFormat("<u>", "</u>") },
                { icon: Link2, label: "Link", onClick: () => applyFormat("[", "](https://example.com)", "link text") },
                { icon: Square, label: "Block", onClick: () => applyFormat("> ", "", "highlighted note") },
                { icon: AlignLeft, label: "Align left", onClick: () => applyFormat("", "", "left aligned text") },
                { icon: AlignCenter, label: "Align center", onClick: () => applyFormat("<center>", "</center>") },
                { icon: AlignRight, label: "Align right", onClick: () => applyFormat("<div align=\"right\">", "</div>", "right aligned text") },
                { icon: List, label: "List", onClick: () => applyFormat("- ", "", "list item") },
                { icon: Image, label: "Add image URL", onClick: () => mediaInputRef.current?.focus() },
                { icon: Sigma, label: "Formula", onClick: () => applyFormat("$", "$", "x + y = z") }
              ].map(({ icon: Icon, label, onClick }) => (
                <button
                  key={label}
                  type="button"
                  className="grid h-7 w-7 place-items-center rounded-[5px] transition-colors duration-200 hover:bg-brand-secondary hover:text-brand-secondaryText"
                  aria-label={label}
                  onClick={onClick}
                >
                  <Icon size={15} />
                </button>
              ))}
            </div>
            <div className="relative">
              <textarea
                className="min-h-[170px] w-full resize-y border-0 bg-white p-4 pr-12 text-brand-ink outline-none placeholder:text-[#c8ced8]"
                placeholder="Type here"
                {...register("text")}
              />
              <button
                type="button"
                className="absolute right-4 top-4 text-[#c8ced8] transition-colors duration-200 hover:text-brand-danger"
                aria-label="Clear question text"
                onClick={() => setValue("text", "", { shouldDirty: true, shouldValidate: true })}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
          {errors.text ? <small className="text-xs font-semibold text-[#e44855]">{errors.text.message}</small> : null}
        </div>

        <h2 className="m-0 text-base font-semibold text-brand-ink">Type the options below</h2>
        <div className="grid gap-4">
          {[0, 1, 2, 3].map((index) => {
            const key = ["optionA", "optionB", "optionC", "optionD"][index] as keyof QuestionValues;
            return (
              <label className="flex items-center gap-3" key={key}>
                <input type="radio" value={index} {...register("correctOption")} />
                <span className="relative flex-1">
                  <input
                    className="min-h-12 w-full rounded-[7px] border border-[#cbd2dc] bg-white px-4 pr-12 text-brand-ink outline-none placeholder:text-[#c8ced8] focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                    placeholder="Type Option here"
                    {...register(key)}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c8ced8] transition-colors duration-200 hover:text-brand-danger"
                    aria-label={`Clear option ${index + 1}`}
                    onClick={() => setValue(key, "", { shouldDirty: true, shouldValidate: true })}
                  >
                    <Trash2 size={18} />
                  </button>
                </span>
              </label>
            );
          })}
        </div>
        <label className="relative grid gap-3 font-medium text-brand-ink">
          <span>Add Solution</span>
          <span className="relative">
            <textarea
              className={`min-h-40 w-full resize-y rounded-[7px] border bg-white p-4 pr-12 text-brand-ink outline-none placeholder:text-[#c8ced8] focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 ${errors.explanation ? "border-[#ff7b86]" : "border-[#cbd2dc]"}`}
              placeholder="Type here"
              {...register("explanation")}
            />
            <button
              type="button"
              className="absolute right-4 top-4 text-[#c8ced8] transition-colors duration-200 hover:text-brand-danger"
              aria-label="Clear solution"
              onClick={() => setValue("explanation", "", { shouldDirty: true, shouldValidate: true })}
            >
              <Trash2 size={18} />
            </button>
          </span>
          {errors.explanation ? <small className="text-xs font-semibold text-[#e44855]">{errors.explanation.message}</small> : null}
        </label>

        <div className="flex items-center justify-center gap-48 py-5 text-[#c8ced8]">
          <button type="button" className="transition-colors duration-200 hover:text-brand-secondaryText" aria-label="Previous question">
            <ChevronLeft size={18} />
          </button>
          <button type="button" className="transition-colors duration-200 hover:text-brand-secondaryText" aria-label="Next question">
            <ChevronRight size={18} />
          </button>
        </div>

        <h2 className="m-0 text-base font-semibold text-brand-ink">Question settings</h2>
        <div className="grid grid-cols-1 gap-y-6">
          <Select label="Level of Difficulty" options={["Easy", "Medium", "Difficult"]} error={errors.difficulty?.message} {...register("difficulty")} />
          <Select label="Topic" options={test.topics} error={errors.topic?.message} {...register("topic")} />
          <Select label="Sub-topic" options={test.subTopics} error={errors.subTopic?.message} {...register("subTopic")} />
          <Input
            label="Question Image URL"
            placeholder="https://example.com/question-image.png"
            error={errors.mediaUrl?.message}
            {...mediaRegister}
            ref={(element) => {
              mediaRegister.ref(element);
              mediaInputRef.current = element;
            }}
          />
        </div>
        <div className="mt-2.5 flex items-center justify-between gap-5 max-[720px]:flex-col max-[720px]:items-stretch">
          <Button variant="danger" size="lg" type="button" onClick={() => confirmNavigation(() => navigate("/dashboard"))}>
            Exit Test Creation
          </Button>
          <div className="flex gap-4 max-[720px]:flex-col">
            <Button size="lg" type="button" onClick={continueToPreview}>
              Next
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
