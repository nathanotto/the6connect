/**
 * Questions Page
 *
 * Display 5 most recent questions with answers from all members
 */

import { createClient } from '@/lib/supabase/server';
import { QuestionForm } from '@/components/questions/question-form';
import { AnswerForm } from '@/components/questions/answer-form';
import { format } from 'date-fns';
import Link from 'next/link';

export default async function QuestionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch 5 most recent questions
  const { data: questions } = await supabase
    .from('questions')
    .select(`
      *,
      asked_by:users!questions_asked_by_user_id_fkey(id, full_name, display_name)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(5);

  // For each question, fetch all answers
  const questionsWithAnswers = await Promise.all(
    (questions || []).map(async (question) => {
      const { data: answers } = await supabase
        .from('question_answers')
        .select(`
          *,
          user:users(id, full_name, display_name)
        `)
        .eq('question_id', question.id)
        .order('created_at', { ascending: true });

      return {
        ...question,
        answers: answers || [],
      };
    })
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Questions</h1>
        <p className="text-foreground/60 mt-2">
          Ask reflective questions and answer as a group
        </p>
      </div>

      {/* Recent Questions and Ask a Question - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 5 Most Recent Questions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Questions (5 Most Recent)</h2>
          {questionsWithAnswers && questionsWithAnswers.length > 0 ? (
            <div className="space-y-6">
              {questionsWithAnswers.map((question: any) => (
                <div
                  key={question.id}
                  className="border border-foreground/20 rounded-lg p-6"
                >
                  {/* Question Header */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-lg font-semibold">{question.question_text}</h3>
                      <span className="text-xs text-foreground/60 whitespace-nowrap">
                        {format(new Date(question.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/60">
                      Asked by{' '}
                      <Link
                        href={`/dashboard/profile/${question.asked_by.id}`}
                        className="font-medium hover:underline"
                      >
                        {question.asked_by.display_name || question.asked_by.full_name}
                      </Link>
                    </p>
                    {question.context && (
                      <p className="text-sm text-foreground/80 mt-2 italic">
                        {question.context}
                      </p>
                    )}
                  </div>

                  {/* Answers */}
                  <div className="space-y-3 mb-4">
                    <h4 className="text-sm font-semibold text-foreground/80">
                      Answers ({question.answers.length})
                    </h4>
                    {question.answers.length > 0 ? (
                      <div className="space-y-3">
                        {question.answers.map((answer: any) => (
                          <div
                            key={answer.id}
                            className="bg-foreground/5 rounded-lg p-3"
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <Link
                                href={`/dashboard/profile/${answer.user.id}`}
                                className="text-sm font-medium hover:underline"
                              >
                                {answer.user.display_name || answer.user.full_name}
                              </Link>
                              <span className="text-xs text-foreground/60">
                                {format(new Date(answer.created_at), 'MMM d')}
                              </span>
                            </div>
                            <p className="text-sm text-foreground/90">
                              {answer.answer_text}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-foreground/60">
                        No answers yet. Be the first to answer!
                      </p>
                    )}
                  </div>

                  {/* Answer Form */}
                  <div className="pt-3 border-t border-foreground/10">
                    <AnswerForm
                      questionId={question.id}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-foreground/20 rounded-lg p-8 text-center">
              <p className="text-foreground/60">
                No questions yet. Be the first to ask a question!
              </p>
            </div>
          )}
        </div>

        {/* Submit New Question */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Ask a Question</h2>
          <div className="border border-foreground/20 rounded-lg p-4">
            <QuestionForm />
          </div>
        </div>
      </div>
    </div>
  );
}
