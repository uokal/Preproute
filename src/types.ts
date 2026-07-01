export type TestStatus = "Draft" | "Questions" | "Ready" | "Published";
export type Difficulty = "Easy" | "Medium" | "Difficult";
export type TestType = "Chapterwise" | "PYQ" | "Mock Test";

export type Question = {
  id: string;
  text: string;
  options: [string, string, string, string];
  correctOption: number;
  explanation: string;
  difficulty: Difficulty;
  topic: string;
  subTopic: string;
  topicId?: string;
  subTopicId?: string;
  mediaUrl?: string;
};

export type Test = {
  id: string;
  name: string;
  subject: string;
  subjectId?: string;
  type: TestType;
  topics: string[];
  subTopics: string[];
  topicIds?: string[];
  subTopicIds?: string[];
  difficulty: Difficulty;
  correctMarks: number;
  wrongMarks: number;
  unattemptMarks: number;
  totalTime: number;
  totalMarks: number;
  totalQuestions: number;
  status: TestStatus;
  createdAt: string;
  questions: Question[];
  questionIds?: string[];
  rawStatus?: string | null;
  displayStatus?: string;
  publishMode?: "now" | "schedule";
  liveUntil?: string;
};
