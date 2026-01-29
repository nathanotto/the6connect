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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-neutral-500 dark:border-neutral-600">
        {/* 5 Most Recent Questions */}
        <div className="p-6 bg-neutral-700/10 dark:bg-neutral-800/20">
          <h2 className="text-xl font-semibold mb-4 text-neutral-800 dark:text-neutral-300">Recent Questions (5 Most Recent)</h2>
          {questionsWithAnswers && questionsWithAnswers.length > 0 ? (
            <div className="space-y-0">
              {questionsWithAnswers.map((question: any, index: number) => (
                <div
                  key={question.id}
                  className={`border border-neutral-500 dark:border-neutral-600 p-0 bg-neutral-100/50 dark:bg-neutral-900/20 ${index > 0 ? 'mt-4' : ''}`}
                >
                  {/* Question Header */}
                  <div className="border-b border-neutral-500 dark:border-neutral-600 p-4 bg-neutral-200 dark:bg-neutral-800/40">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-200">{question.question_text}</h3>
                      <span className="text-xs text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                        {format(new Date(question.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-400">
                      Asked by{' '}
                      <Link
                        href={`/dashboard/profile/${question.asked_by.id}`}
                        className="font-medium hover:underline"
                      >
                        {question.asked_by.display_name || question.asked_by.full_name}
                      </Link>
                    </p>
                    {question.context && (
                      <p className="text-sm text-neutral-800 dark:text-neutral-300 mt-2 italic">
                        {question.context}
                      </p>
                    )}
                  </div>

                  {/* Answers */}
                  <div className="border-b border-neutral-500 dark:border-neutral-600 p-4 space-y-0 bg-white dark:bg-neutral-900/30">
                    <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-300 mb-3">
                      Answers ({question.answers.length})
                    </h4>
                    {question.answers.length > 0 ? (
                      <div className="space-y-0">
                        {question.answers.map((answer: any) => (
                          <div
                            key={answer.id}
                            className="border border-neutral-500 dark:border-neutral-600 p-3 bg-neutral-100 dark:bg-neutral-800/30"
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <Link
                                href={`/dashboard/profile/${answer.user.id}`}
                                className="text-sm font-medium text-neutral-800 dark:text-neutral-300 hover:underline"
                              >
                                {answer.user.display_name || answer.user.full_name}
                              </Link>
                              <span className="text-xs text-neutral-600 dark:text-neutral-400">
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
                      <div className="border border-neutral-500 dark:border-neutral-600 p-3 bg-white dark:bg-neutral-900/30">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          No answers yet. Be the first to answer!
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Answer Form */}
                  <div className="p-4 bg-neutral-100/50 dark:bg-neutral-900/20">
                    <AnswerForm
                      questionId={question.id}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-neutral-500 dark:border-neutral-600 p-8 text-center bg-white dark:bg-neutral-900/30">
              <p className="text-neutral-600 dark:text-neutral-400">
                No questions yet. Be the first to ask a question!
              </p>
            </div>
          )}
        </div>

        {/* Submit New Question */}
        <div className="border-t md:border-t-0 md:border-l border-neutral-500 dark:border-neutral-600 p-6 bg-stone-700/10 dark:bg-stone-800/20">
          <h2 className="text-xl font-semibold mb-4 text-stone-800 dark:text-stone-300">Ask a Question</h2>
          <div className="border border-stone-500 dark:border-stone-600 p-4 bg-white dark:bg-stone-900/30">
            <QuestionForm />
          </div>
        </div>
      </div>
    </div>
  );
}
