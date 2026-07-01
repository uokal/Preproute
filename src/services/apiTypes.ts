import { Difficulty, Question, Test, TestStatus, TestType } from "../types";

export type ApiSubject = {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
};

export type ApiTopic = {
  id: string;
  subject_id?: string;
  name: string;
};

export type ApiSubTopic = {
  id: string;
  topic_id?: string;
  name: string;
};

export type ApiTest = {
  id: string;
  name: string;
  type: string;
  subject: string;
  subject_id?: string | null;
  topics: string[] | null;
  topic_ids?: string[] | null;
  sub_topics: string[] | null;
  sub_topic_ids?: string[] | null;
  questions: string[] | ApiQuestion[] | null;
  correct_marks: number;
  wrong_marks: number;
  unattempt_marks: number;
  difficulty: string;
  total_time: number;
  total_marks: number;
  total_questions: number;
  status: string | null;
  created_at: string;
  updated_at?: string | null;
};

export type ApiQuestion = {
  id: string;
  type: string;
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct_option: string;
  explanation: string;
  difficulty: string;
  media_url?: string | null;
  test_id?: string;
  subject?: string | null;
  topic?: string | null;
  sub_topic?: string | null;
};

export type TestPayload = {
  name?: string;
  type?: string;
  subject?: string;
  topics?: string[];
  sub_topics?: string[];
  correct_marks?: number;
  wrong_marks?: number;
  unattempt_marks?: number;
  difficulty?: string;
  total_time?: number;
  total_marks?: number;
  total_questions?: number;
  status?: string | null;
  questions?: string[];
};

export type BulkQuestionPayload = {
  questions: Array<{
    type: "mcq";
    question: string;
    option1: string;
    option2: string;
    option3: string;
    option4: string;
    correct_option: string;
    explanation: string;
    difficulty: string;
    test_id: string;
    subject: string;
    media_url?: string;
  }>;
};

const titleCase = (value: string | null | undefined, fallback = "Draft") =>
  (value ?? fallback)
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const toDifficulty = (value: string | null | undefined): Difficulty => {
  const normalized = (value ?? "easy").toLowerCase();
  if (normalized === "medium") return "Medium";
  if (normalized === "hard" || normalized === "difficult") return "Difficult";
  return "Easy";
};

const toType = (value: string | null | undefined): TestType => {
  const normalized = (value ?? "chapterwise").toLowerCase();
  if (normalized === "pyq") return "PYQ";
  if (normalized === "mock" || normalized === "mock test") return "Mock Test";
  return "Chapterwise";
};

const toStatus = (value: string | null | undefined): TestStatus => {
  const normalized = (value ?? "draft").toLowerCase();
  if (normalized === "live" || normalized === "published") return "Published";
  if (normalized === "unpublished" || normalized === "ready") return "Ready";
  if (normalized === "questions") return "Questions";
  return "Draft";
};

export const toApiType = (value: TestType) => {
  if (value === "PYQ") return "pyq";
  if (value === "Mock Test") return "mock";
  return "chapterwise";
};

export const toApiDifficulty = (value: Difficulty) => {
  if (value === "Difficult") return "hard";
  return value.toLowerCase();
};

export const mapApiQuestion = (question: ApiQuestion): Question => {
  const optionNumber = Number(question.correct_option?.replace("option", ""));
  return {
    id: question.id,
    text: question.question,
    options: [question.option1, question.option2, question.option3, question.option4],
    correctOption: Number.isFinite(optionNumber) && optionNumber >= 1 ? optionNumber - 1 : 0,
    explanation: question.explanation ?? "",
    difficulty: toDifficulty(question.difficulty),
    topic: question.topic ?? "",
    subTopic: question.sub_topic ?? "",
    topicId: question.topic ?? undefined,
    subTopicId: question.sub_topic ?? undefined,
    mediaUrl: question.media_url ?? undefined
  };
};

export const mapApiTest = (test: ApiTest, questions: Question[] = []): Test => ({
  id: test.id,
  name: test.name,
  type: toType(test.type),
  subject: test.subject,
  subjectId: test.subject_id ?? undefined,
  topics: test.topics ?? [],
  subTopics: test.sub_topics ?? [],
  topicIds: test.topic_ids ?? undefined,
  subTopicIds: test.sub_topic_ids ?? undefined,
  difficulty: toDifficulty(test.difficulty),
  correctMarks: Number(test.correct_marks ?? 0),
  wrongMarks: Number(test.wrong_marks ?? 0),
  unattemptMarks: Number(test.unattempt_marks ?? 0),
  totalTime: Number(test.total_time ?? 0),
  totalMarks: Number(test.total_marks ?? 0),
  totalQuestions: Number(test.total_questions ?? 0),
  status: toStatus(test.status),
  createdAt: test.created_at ? test.created_at.slice(0, 10) : "",
  questions,
  questionIds: Array.isArray(test.questions)
    ? test.questions.map((question) => (typeof question === "string" ? question : question.id)).filter(Boolean)
    : [],
  rawStatus: test.status ?? null,
  displayStatus: titleCase(test.status)
});
