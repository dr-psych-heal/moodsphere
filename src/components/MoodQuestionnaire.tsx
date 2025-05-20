
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import MoodSlider from './MoodSlider';
import { useToast } from "@/components/ui/use-toast";
import { MoodEntry, Question } from '../types';

interface MoodQuestionnaireProps {
  onSubmit: (entry: MoodEntry) => void;
}

const questions: Question[] = [
  {
    id: 1,
    text: "How would you rate your overall mood today?",
  },
  {
    id: 2,
    text: "How well did you manage stress today?",
  },
  {
    id: 3,
    text: "How connected did you feel with others today?",
  },
  {
    id: 4,
    text: "How would you rate your energy levels today?",
  },
  {
    id: 5,
    text: "How satisfied are you with your accomplishments today?",
  },
];

const MoodQuestionnaire: React.FC<MoodQuestionnaireProps> = ({ onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>(questions.map(() => 5));
  const { toast } = useToast();

  const isLastQuestion = currentStep === questions.length - 1;
  
  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleAnswerChange = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    const overallScore = parseFloat((answers.reduce((sum, val) => sum + val, 0) / answers.length).toFixed(1));
    
    const entry: MoodEntry = {
      date: new Date().toISOString(),
      answers: answers.map((value, index) => ({
        questionId: questions[index].id,
        value
      })),
      overallScore
    };
    
    onSubmit(entry);
    
    toast({
      title: "Mood log saved",
      description: `Your mood score: ${overallScore}/10`,
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Track Your Mood</h2>
        <span className="text-sm text-gray-500">Question {currentStep + 1} of {questions.length}</span>
      </div>
      
      <div className="mb-6">
        <MoodSlider 
          question={questions[currentStep].text}
          value={answers[currentStep]}
          onChange={handleAnswerChange}
        />
      </div>
      
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        <Button onClick={handleNext}>
          {isLastQuestion ? "Submit" : "Next"}
        </Button>
      </div>
    </div>
  );
};

export default MoodQuestionnaire;
