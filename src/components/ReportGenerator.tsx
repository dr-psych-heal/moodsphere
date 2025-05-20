
import React from 'react';
import { Button } from "@/components/ui/button";
import { MoodEntry } from '../types';
import MoodEmoji from './MoodEmoji';

interface ReportGeneratorProps {
  entries: MoodEntry[];
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ entries }) => {
  if (entries.length === 0) return null;
  
  // Get the most recent entry
  const latestEntry = entries[entries.length - 1];
  
  // Calculate average score from all entries
  const averageScore = parseFloat(
    (entries.reduce((sum, entry) => sum + entry.overallScore, 0) / entries.length).toFixed(1)
  );
  
  // Identify trend (improving, worsening, stable)
  let trend = "stable";
  if (entries.length > 1) {
    const previousAvg = entries.slice(0, -1).reduce((sum, entry) => sum + entry.overallScore, 0) / (entries.length - 1);
    if (latestEntry.overallScore > previousAvg + 0.5) trend = "improving";
    else if (latestEntry.overallScore < previousAvg - 0.5) trend = "worsening";
  }
  
  // Generate insights based on the data
  const getInsights = () => {
    const insights = [
      `Your current emotional health score is ${latestEntry.overallScore}/10, which indicates a ${getMoodLabel(latestEntry.overallScore)} overall mood.`,
      `Your average emotional health score is ${averageScore}/10.`,
    ];
    
    if (trend === "improving") {
      insights.push("Your emotional health appears to be improving. This positive trend suggests your current approaches to emotional well-being are effective.");
    } else if (trend === "worsening") {
      insights.push("Your emotional health appears to be declining recently. It might be helpful to discuss potential stressors or challenges with your therapist.");
    } else {
      insights.push("Your emotional health has remained relatively stable. Maintaining consistency can be positive, especially if you're in a good emotional state.");
    }
    
    return insights;
  };
  
  const getMoodLabel = (score: number) => {
    if (score >= 8) return "great";
    if (score >= 6) return "good";
    if (score >= 4) return "okay";
    if (score >= 2) return "bad";
    return "terrible";
  };
  
  const handleShareReport = () => {
    // In a real application, this would generate a shareable link or PDF
    // For now, we'll just simulate the action
    alert("This feature would generate a shareable report for your therapist. In a full implementation, you could export this as a PDF or send a secure link.");
  };
  
  const insights = getInsights();
  
  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Your Emotional Health Report</h3>
        <MoodEmoji score={latestEntry.overallScore} />
      </div>
      
      <div className="space-y-4 mb-6">
        <div>
          <h4 className="font-medium mb-2">Key Insights:</h4>
          <ul className="list-disc pl-5 space-y-2">
            {insights.map((insight, index) => (
              <li key={index} className="text-gray-700">{insight}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Recommendations:</h4>
          <p className="text-gray-700">
            Based on your responses, consider discussing the following with your therapist:
            {trend === "worsening" 
              ? " Recent emotional challenges and potential stressors."
              : " Maintaining current positive habits and exploring additional wellness practices."}
          </p>
        </div>
      </div>
      
      <Button onClick={handleShareReport} className="w-full">
        Share Report with Therapist
      </Button>
    </div>
  );
};

export default ReportGenerator;
