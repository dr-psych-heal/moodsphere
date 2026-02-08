
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Activity, BookOpen, BrainCircuit, History, TrendingUp, ChevronRight, X, Clock } from 'lucide-react';
import { MoodEntry, JournalEntry, ThoughtRecord } from '../types';
import { moodQuestions } from './MoodQuestionnaire';
import { format } from 'date-fns';
import MoodGraph from './MoodGraph';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface AdminDashboardProps {
    allEntries: any[];
    allUsers: { username: string, fullName: string, role: string }[];
    journalEntries?: JournalEntry[];
    thoughtRecords?: ThoughtRecord[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
    allEntries,
    allUsers,
    journalEntries = [],
    thoughtRecords = []
}) => {
    const [selectedUser, setSelectedUser] = useState<string | null>(null);

    const mapToMoodEntry = (raw: any): MoodEntry => ({
        date: raw.Date,
        overallScore: parseFloat(raw["Overall Score"]),
        triggers: raw.Triggers ? raw.Triggers.split(', ') : [],
        answers: [
            { questionId: 1, value: parseFloat(raw["Q1: Overall Mood"]) },
            { questionId: 2, value: parseFloat(raw["Q2: Stress"]) },
            { questionId: 3, value: parseFloat(raw["Q3: Social"]) },
            { questionId: 4, value: parseFloat(raw["Q4: Energy"]) },
            { questionId: 5, value: parseFloat(raw["Q5: Satisfaction"]) },
        ]
    });

    const getUserStats = (username: string) => {
        const userEntries = allEntries.filter(e => e.Username === username);
        const userJournals = journalEntries.filter(e => e.username === username);
        const userThoughts = thoughtRecords.filter(e => e.username === username);

        const daysRecorded = userEntries.length;

        if (daysRecorded === 0 && userJournals.length === 0 && userThoughts.length === 0) return null;

        const sortedMoods = [...userEntries].sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());
        const lastMoodEntry = sortedMoods.length > 0 ? sortedMoods[sortedMoods.length - 1] : null;

        const lastJournal = userJournals.length > 0
            ? [...userJournals].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
            : null;

        const lastThought = userThoughts.length > 0
            ? [...userThoughts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
            : null;

        const avgScore = daysRecorded > 0
            ? (userEntries.reduce((sum, e) => sum + parseFloat(e["Overall Score"]), 0) / daysRecorded).toFixed(1)
            : "N/A";

        // Get trigger frequency
        const triggerMap: Record<string, number> = {};
        userEntries.forEach(e => {
            const triggers = e.Triggers ? e.Triggers.split(', ') : [];
            triggers.forEach((t: string) => {
                triggerMap[t] = (triggerMap[t] || 0) + 1;
            });
        });

        const topTriggers = Object.entries(triggerMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([name]) => name);

        // Calculate Next Due
        let nextDue = 'Today';
        if (lastMoodEntry) {
            const nextDate = new Date(lastMoodEntry.Date);
            nextDate.setDate(nextDate.getDate() + 1);
            nextDue = format(nextDate, 'MMM d, yyyy');
        }

        return {
            daysRecorded,
            avgScore,
            lastMoodEntry,
            lastJournal,
            lastThought,
            journalCount: userJournals.length,
            thoughtCount: userThoughts.length,
            topTriggers,
            nextDue,
            allMoods: sortedMoods.map(mapToMoodEntry),
            allJournals: [...userJournals].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
            allThoughts: [...userThoughts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        };
    };

    const UserDetailModal = ({ username, fullName }: { username: string, fullName: string }) => {
        const stats = getUserStats(username);
        if (!stats) return null;

        return (
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-primary/20">
                <DialogHeader className="p-6 bg-primary/5 border-b border-primary/10">
                    <div className="flex justify-between items-center">
                        <div>
                            <DialogTitle className="text-2xl font-black text-primary">{fullName}</DialogTitle>
                            <DialogDescription className="font-mono text-[10px] uppercase tracking-widest opacity-60">Complete Patient Record • @{username}</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6">
                    <div className="space-y-10">
                        {/* Mood History Section */}
                        <section className="space-y-4">
                            <h3 className="text-lg font-bold flex items-center gap-2 text-primary">
                                <Activity className="h-5 w-5" /> Mood History & Trends
                            </h3>
                            <MoodGraph data={stats.allMoods} height={200} hideHeader />
                        </section>

                        <Separator className="bg-primary/10" />

                        {/* Longitudinal Logs Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Journal Column */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold flex items-center gap-2 text-primary/80">
                                    <BookOpen className="h-5 w-5" /> Emotional Journal
                                </h3>
                                <div className="space-y-3">
                                    {stats.allJournals.length > 0 ? stats.allJournals.map((j, i) => (
                                        <div key={i} className="p-4 rounded-xl bg-primary/5 border border-primary/5 space-y-2">
                                            <div className="flex justify-between items-center">
                                                <Badge variant="outline" className="text-[9px] bg-primary/10 border-none">Entry #{j.dayNumber || stats.allJournals.length - i}</Badge>
                                                <span className="text-[10px] text-muted-foreground">{format(new Date(j.date), 'MMM d, p')}</span>
                                            </div>
                                            <p className="text-sm font-medium leading-relaxed italic">"{j.content}"</p>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-muted-foreground italic text-center py-8">No journal entries found.</p>
                                    )}
                                </div>
                            </div>

                            {/* CBT Column */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold flex items-center gap-2 text-destructive/80">
                                    <BrainCircuit className="h-5 w-5" /> Thought Records (CBT)
                                </h3>
                                <div className="space-y-3">
                                    {stats.allThoughts.length > 0 ? stats.allThoughts.map((t, i) => (
                                        <div key={i} className="p-4 rounded-xl bg-destructive/[0.03] border border-destructive/10 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <Badge className="bg-destructive/10 text-destructive border-none text-[9px] uppercase font-black">{t.emotion}</Badge>
                                                <span className="text-[10px] text-muted-foreground">{format(new Date(t.date), 'MMM d, p')}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground/60">Situation</p>
                                                <p className="text-xs font-bold leading-tight">{t.situation}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-destructive" style={{ width: `${t.intensityScore}%` }} />
                                                </div>
                                                <TrendingUp className="h-3 w-3 text-green-500" />
                                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-green-500" style={{ width: `${t.emotionAfterIntensity}%` }} />
                                                </div>
                                            </div>
                                            <div className="pt-2 border-t border-destructive/5">
                                                <p className="text-[10px] font-black uppercase text-muted-foreground/60 mb-1">Balanced Thought</p>
                                                <p className="text-xs italic text-primary font-medium">"{t.alternativeThought}"</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-muted-foreground italic text-center py-8">No thought records found.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                        <Users className="h-6 w-6" /> Admin Overview
                    </h2>
                    <p className="text-muted-foreground">Bird's-eye view of all user activity and mental health logs</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Badge variant="outline" className="px-4 py-1.5 text-xs font-bold bg-white/50 dark:bg-gray-800/50 border-primary/20">
                        {allUsers.length} Users
                    </Badge>
                    <Badge variant="outline" className="px-4 py-1.5 text-xs font-bold bg-white/50 dark:bg-gray-800/50 border-primary/20">
                        {allEntries.length} Mood Logs
                    </Badge>
                    <Badge variant="outline" className="px-4 py-1.5 text-xs font-bold bg-white/50 dark:bg-gray-800/50 border-primary/20">
                        {journalEntries.length} Journals
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allUsers.map((user) => {
                    const stats = getUserStats(user.username);

                    return (stats || user.role === 'admin') ? (
                        <Dialog key={user.username}>
                            <DialogTrigger asChild>
                                <Card className="overflow-hidden border-primary/10 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md group relative cursor-pointer hover:border-primary/40 active:scale-[0.98]">
                                    {user.role === 'admin' && (
                                        <div className="absolute top-0 right-0 p-1">
                                            <Badge className="bg-primary/20 text-primary border-none text-[8px] px-1 py-0 uppercase">Staff</Badge>
                                        </div>
                                    )}
                                    <CardHeader className="pb-2 bg-primary/[0.02] border-b border-primary/5">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">{user.fullName}</CardTitle>
                                                <CardDescription className="text-[10px] font-mono uppercase tracking-tighter">ID: {user.username}</CardDescription>
                                            </div>
                                            <Badge variant={user.role === 'admin' ? "default" : "secondary"} className="uppercase text-[9px] font-black h-5">
                                                {user.role}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-5 pt-5">
                                        {stats ? (
                                            <>
                                                {/* Main Stats Row */}
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div className="bg-primary/5 rounded-xl p-2 text-center border border-primary/5">
                                                        <p className="text-[8px] uppercase text-muted-foreground font-black mb-1">Avg</p>
                                                        <p className="text-lg font-black text-primary leading-none">{stats.avgScore}</p>
                                                    </div>
                                                    <div className="bg-primary/5 rounded-xl p-2 text-center border border-primary/5">
                                                        <p className="text-[8px] uppercase text-muted-foreground font-black mb-1">Moods</p>
                                                        <p className="text-lg font-black text-primary leading-none">{stats.daysRecorded}</p>
                                                    </div>
                                                    <div className="bg-primary/5 rounded-xl p-2 text-center border border-primary/5">
                                                        <p className="text-[8px] uppercase text-muted-foreground font-black mb-1">Logs</p>
                                                        <p className="text-lg font-black text-primary leading-none">{stats.journalCount + stats.thoughtCount}</p>
                                                    </div>
                                                </div>

                                                {/* Sparkline Trend */}
                                                {stats.allMoods.length > 0 && (
                                                    <div className="space-y-1">
                                                        <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest flex items-center justify-between">
                                                            <span>Trend</span>
                                                            <TrendingUp className="h-2 w-2" />
                                                        </p>
                                                        <MoodGraph data={stats.allMoods} compact />
                                                    </div>
                                                )}

                                                {/* Latest Insight */}
                                                {stats.lastJournal ? (
                                                    <div className="flex items-start gap-2 p-2 rounded-lg bg-primary/[0.03] border border-primary/5">
                                                        <BookOpen className="h-3 w-3 text-primary mt-0.5 opacity-60" />
                                                        <p className="text-[10px] leading-tight font-medium italic line-clamp-2 text-muted-foreground">
                                                            "{stats.lastJournal.content}"
                                                        </p>
                                                    </div>
                                                ) : stats.lastThought ? (
                                                    <div className="flex items-start gap-2 p-2 rounded-lg bg-destructive/[0.03] border border-destructive/5">
                                                        <BrainCircuit className="h-3 w-3 text-destructive mt-0.5 opacity-60" />
                                                        <p className="text-[10px] leading-tight font-medium line-clamp-2 text-muted-foreground">
                                                            Challenge: {stats.lastThought.situation}
                                                        </p>
                                                    </div>
                                                ) : null}

                                                {/* Meta Footer */}
                                                <div className="pt-2 border-t border-primary/5 flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-muted-foreground/60">Last: {stats.lastMoodEntry ? format(new Date(stats.lastMoodEntry.Date), 'MMM d') : 'Never'}</span>
                                                        <span className="text-primary/80">Next: {stats.nextDue}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-primary animate-pulse">
                                                        <span className="text-[8px]">Details</span>
                                                        <ChevronRight className="h-3 w-3" />
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="py-20 text-center space-y-3 opacity-30">
                                                <Calendar className="h-10 w-10 mx-auto text-muted-foreground" />
                                                <p className="text-[10px] font-black uppercase tracking-widest">Awaiting First Log</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </DialogTrigger>
                            <UserDetailModal username={user.username} fullName={user.fullName} />
                        </Dialog>
                    ) : null;
                })}
            </div>
        </div>
    );
};

export default AdminDashboard;
