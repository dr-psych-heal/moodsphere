
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useTheme } from 'next-themes';
import MoodQuestionnaire from '../components/MoodQuestionnaire';
import MoodGraph from '../components/MoodGraph';
import ReportGenerator from '../components/ReportGenerator';
import { MoodEntry } from '../types';
import { Moon, Sun } from 'lucide-react';

const Index = () => {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [activeTab, setActiveTab] = useState("track");
  const { setTheme, theme } = useTheme();
  
  // Load data from localStorage on initial render
  useEffect(() => {
    const savedEntries = localStorage.getItem('moodEntries');
    if (savedEntries) {
      setMoodEntries(JSON.parse(savedEntries));
    } else {
      // Generate sample data if no entries exist
      generateSampleData();
    }
  }, []);
  
  // Save data to localStorage whenever entries change
  useEffect(() => {
    localStorage.setItem('moodEntries', JSON.stringify(moodEntries));
  }, [moodEntries]);
  
  const handleMoodSubmit = (entry: MoodEntry) => {
    setMoodEntries(prev => [...prev, entry]);
    setActiveTab("insights");
  };

  // Generate sample data if no entries exist
  const generateSampleData = () => {
    if (moodEntries.length === 0) {
      const sampleData: MoodEntry[] = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Create random mood entries with scores between 3 and 8
        const score = 3 + Math.random() * 5;
        sampleData.push({
          date: date.toISOString(),
          answers: Array(5).fill(0).map((_, idx) => ({
            questionId: idx + 1,
            value: 3 + Math.random() * 5
          })),
          overallScore: parseFloat(score.toFixed(1))
        });
      }
      
      setMoodEntries(sampleData);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent to-white dark:from-primary dark:to-background">
      <div className="container max-w-4xl pt-10 pb-20 px-4">
        <div className="flex justify-between items-center mb-8">
          <div className="text-left">
            <h1 className="text-3xl font-bold text-primary mb-2">MoodSphere</h1>
            <p className="text-gray-600 dark:text-gray-400">Track, visualize, and understand your emotional health</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Sun className="h-4 w-4" />
            <Switch 
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme} 
            />
            <Moon className="h-4 w-4" />
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="track">Track Mood</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="track" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <MoodQuestionnaire onSubmit={handleMoodSubmit} />
                
                {moodEntries.length > 0 && (
                  <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium mb-4">Recent Mood History</h3>
                    <MoodGraph data={moodEntries.slice(-7)} />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                {moodEntries.length > 0 ? (
                  <MoodGraph data={moodEntries} />
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-500 dark:text-gray-400">No mood entries yet. Start tracking your mood to see history.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="insights" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                {moodEntries.length > 0 ? (
                  <ReportGenerator entries={moodEntries} />
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-500 dark:text-gray-400">Complete a mood check-in to generate insights.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {moodEntries.length > 0 && activeTab === "track" && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You've logged {moodEntries.length} mood entries. Great job tracking your emotional health!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
