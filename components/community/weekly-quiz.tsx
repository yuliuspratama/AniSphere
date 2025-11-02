"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { HelpCircle, CheckCircle2, XCircle, Award } from "lucide-react";
import { toast } from "sonner";
import { animeFactsClient } from "@/lib/api/anime-facts";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  points: number;
}

export function WeeklyQuiz() {
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay()); // Start of week

        const { data: quizzes, error } = await supabase
          .from("quizzes")
          .select("*")
          .gte("week_start", weekStart.toISOString().split("T")[0])
          .lte("week_end", new Date().toISOString().split("T")[0])
          .limit(1);

        if (error) throw error;

        if (quizzes && quizzes.length > 0) {
          setQuiz(quizzes[0] as Quiz);
        } else {
          // Generate a sample quiz if none exists
          const sampleQuiz: Quiz = {
            id: "sample",
            title: "Kuis Anime Minggu Ini",
            description: "Uji pengetahuan Anda tentang anime!",
            questions: [
              {
                id: "1",
                question: "Studio mana yang memproduksi Attack on Titan?",
                options: ["Madhouse", "Wit Studio", "Studio Pierrot", "Bones"],
                correct_answer: 1,
              },
              {
                id: "2",
                question: "Siapa penulis manga Fullmetal Alchemist?",
                options: ["Eiichiro Oda", "Hiromu Arakawa", "Masashi Kishimoto", "Tite Kubo"],
                correct_answer: 1,
              },
            ],
            points: 10,
          };
          setQuiz(sampleQuiz);
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchQuiz();
  }, [supabase]);

  const handleAnswer = (questionIndex: number, answerIndex: number) => {
    if (submitted) return;
    setAnswers({ ...answers, [questionIndex]: answerIndex });
  };

  const handleSubmit = async () => {
    if (!quiz || !user) return;

    let correctAnswers = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correct_answer) {
        correctAnswers++;
      }
    });

    const finalScore = Math.round((correctAnswers / quiz.questions.length) * 100);
    setScore(finalScore);
    setShowResults(true);
    setSubmitted(true);

    try {
      // Save quiz attempt
      const { error } = await supabase.from("quiz_attempts").insert({
        quiz_id: quiz.id,
        user_id: user.id,
        answers: answers,
        score: finalScore,
      });

      if (error) throw error;

      toast.success(`Skor Anda: ${finalScore}% (${correctAnswers}/${quiz.questions.length} benar)`);
    } catch (error: any) {
      console.error("Error saving quiz attempt:", error);
      toast.error("Gagal menyimpan hasil kuis");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Memuat kuis...</p>
        </CardContent>
      </Card>
    );
  }

  if (!quiz) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Tidak ada kuis minggu ini</p>
        </CardContent>
      </Card>
    );
  }

  const currentQ = quiz.questions[currentQuestion];
  const hasAnswered = answers[currentQuestion] !== undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          {quiz.title}
        </CardTitle>
        <CardDescription>{quiz.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showResults ? (
          <>
            <div className="text-sm text-muted-foreground">
              Pertanyaan {currentQuestion + 1} dari {quiz.questions.length}
            </div>
            <div className="space-y-4">
              <div className="text-lg font-semibold">{currentQ.question}</div>
              <RadioGroup
                value={answers[currentQuestion]?.toString()}
                onValueChange={(value) => handleAnswer(currentQuestion, parseInt(value))}
              >
                {currentQ.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 rounded border p-3">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
              >
                Sebelumnya
              </Button>
              {currentQuestion < quiz.questions.length - 1 ? (
                <Button
                  onClick={() => setCurrentQuestion(currentQuestion + 1)}
                  disabled={!hasAnswered}
                  className="flex-1"
                >
                  Selanjutnya
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!hasAnswered || submitted}
                  className="flex-1"
                >
                  Kirim Jawaban
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 text-center">
              <Award className="mx-auto h-12 w-12 text-yellow-500" />
              <div className="mt-2 text-2xl font-bold">Skor: {score}%</div>
              <div className="text-sm text-muted-foreground">
                {Object.values(answers).filter(
                  (ans, idx) => ans === quiz.questions[idx].correct_answer
                ).length}{" "}
                dari {quiz.questions.length} benar
              </div>
            </div>
            <div className="space-y-3">
              {quiz.questions.map((question, index) => {
                const userAnswer = answers[index];
                const isCorrect = userAnswer === question.correct_answer;
                return (
                  <div
                    key={index}
                    className={`rounded-lg border p-3 ${
                      isCorrect ? "bg-green-50 dark:bg-green-950" : "bg-red-50 dark:bg-red-950"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold">{question.question}</div>
                        <div className="mt-1 text-sm">
                          Jawaban Anda: {question.options[userAnswer] || "Tidak dijawab"}
                        </div>
                        {!isCorrect && (
                          <div className="mt-1 text-sm text-green-600 dark:text-green-400">
                            Jawaban Benar: {question.options[question.correct_answer]}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

