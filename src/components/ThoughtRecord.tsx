
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { ThoughtRecord as ThoughtRecordType } from '../types';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Brain, ListFilter, Plus, Save, History, TrendingDown, Target, HelpCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ThoughtRecordProps {
    records: ThoughtRecordType[];
    onSave: (record: Omit<ThoughtRecordType, 'username' | 'date'>) => Promise<void>;
    isSubmitting: boolean;
}

const ThoughtRecord: React.FC<ThoughtRecordProps> = ({ records, onSave, isSubmitting }) => {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        situation: '',
        emotion: '',
        intensityScore: 50,
        automaticThought: '',
        evidenceFor: '',
        evidenceAgainst: '',
        alternativeThought: '',
        behaviorResponse: '',
        emotionAfterIntensity: 30
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(formData);
        setShowForm(false);
        setFormData({
            situation: '',
            emotion: '',
            intensityScore: 50,
            automaticThought: '',
            evidenceFor: '',
            evidenceAgainst: '',
            alternativeThought: '',
            behaviorResponse: '',
            emotionAfterIntensity: 30
        });
    };

    const Instruction = ({ title, content }: { title: string, content: string }) => (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help opacity-40 hover:opacity-100 transition-opacity" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[200px] p-2 bg-primary dark:bg-primary text-primary-foreground">
                    <p className="text-[10px] font-bold uppercase mb-1">{title}</p>
                    <p className="text-[11px] leading-tight">{content}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" /> Thought Record
                    </h2>
                    <p className="text-muted-foreground text-xs">Challenge your negative thoughts and find balance.</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"} className="font-semibold text-sm">
                    {showForm ? 'Cancel' : (
                        <>
                            <Plus className="mr-1.5 h-4 w-4" /> New Record
                        </>
                    )}
                </Button>
            </div>

            {showForm && (
                <Card className="border-border bg-card mb-8">
                    <CardHeader className="bg-muted border-b border-border pb-3">
                        <CardTitle className="text-sm font-bold">Structured CBT Entry</CardTitle>
                        <CardDescription className="text-[10px] uppercase font-semibold tracking-widest text-muted-foreground">Complete when your mood is worsening</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-5">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Phase 1: The Situation */}
                                <div className="space-y-3 p-3 rounded-lg bg-muted/50 border border-border">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Target className="h-4 w-4 text-primary" />
                                        <h4 className="font-semibold text-xs uppercase tracking-tight text-foreground">Step 1: The Situation</h4>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                                            SITUATION <Instruction title="Situation" content="What happened? Who was there? Where were you? When did it occur?" />
                                        </label>
                                        <Input
                                            placeholder="e.g., At work during a meeting..."
                                            value={formData.situation}
                                            onChange={e => setFormData({ ...formData, situation: e.target.value })}
                                            className="bg-white/50 dark:bg-gray-900/50"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground">EMOTION</label>
                                            <Input
                                                placeholder="e.g., Anxious, Sad"
                                                value={formData.emotion}
                                                onChange={e => setFormData({ ...formData, emotion: e.target.value })}
                                                className="bg-white/50 dark:bg-gray-900/50"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground">INTENSITY ({formData.intensityScore}%)</label>
                                            <Slider
                                                value={[formData.intensityScore]}
                                                onValueChange={([val]) => setFormData({ ...formData, intensityScore: val })}
                                                max={100}
                                                step={1}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Phase 2: Automatic Thought */}
                                <div className="space-y-3 p-3 rounded-lg bg-destructive/[0.03] border border-destructive/10">
                                    <div className="flex items-center gap-2 mb-1">
                                        <TrendingDown className="h-4 w-4 text-destructive" />
                                        <h4 className="font-semibold text-xs uppercase tracking-tight text-destructive/80">Step 2: Analysis</h4>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                                            AUTOMATIC THOUGHT <Instruction title="Automatic Thought" content="What was going through your mind? What are you afraid might happen?" />
                                        </label>
                                        <Textarea
                                            placeholder="I'm going to fail at this task..."
                                            value={formData.automaticThought}
                                            onChange={e => setFormData({ ...formData, automaticThought: e.target.value })}
                                            className="bg-white/50 dark:bg-gray-900/50 h-24"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Phase 3: Evidence */}
                                <div className="space-y-3 p-3 rounded-lg bg-muted/30 border border-border md:col-span-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                                EVIDENCE FOR <Instruction title="Evidence For" content="What facts support this thought? Avoid interpretations, stick to facts." />
                                            </label>
                                            <Textarea
                                                placeholder="I missed one deadline last month..."
                                                value={formData.evidenceFor}
                                                onChange={e => setFormData({ ...formData, evidenceFor: e.target.value })}
                                                className="h-20"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                                EVIDENCE AGAINST <Instruction title="Evidence Against" content="What indicates the thought isn't 100% true? Past successes? Counter-evidence?" />
                                            </label>
                                            <Textarea
                                                placeholder="I have completed 95% of tasks early..."
                                                value={formData.evidenceAgainst}
                                                onChange={e => setFormData({ ...formData, evidenceAgainst: e.target.value })}
                                                className="h-20"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Phase 4: Resolution */}
                                <div className="space-y-3 p-3 rounded-lg bg-green-500/[0.03] border border-green-500/10 md:col-span-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                                    BALANCED THOUGHT <Instruction title="Balanced Thought" content="Based on all evidence, what is a more realistic way to view this?" />
                                                </label>
                                                <Textarea
                                                    placeholder="I may be under pressure, but I usually pull through..."
                                                    value={formData.alternativeThought}
                                                    onChange={e => setFormData({ ...formData, alternativeThought: e.target.value })}
                                                    className="h-20"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                                    BEHAVIOR/RESPONSE <Instruction title="Response" content="What will you do differently now? How will you handle the situation?" />
                                                </label>
                                                <Input
                                                    placeholder="I will take a 5 min break and then start..."
                                                    value={formData.behaviorResponse}
                                                    onChange={e => setFormData({ ...formData, behaviorResponse: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-center space-y-3 bg-green-500/[0.05] p-4 rounded-lg">
                                            <label className="text-xs font-bold text-green-600 dark:text-green-400 text-center uppercase tracking-tight">
                                                Emotion Intensity After ({formData.emotionAfterIntensity}%)
                                            </label>
                                            <Slider
                                                value={[formData.emotionAfterIntensity]}
                                                onValueChange={([val]) => setFormData({ ...formData, emotionAfterIntensity: val })}
                                                max={100}
                                                step={1}
                                                className="py-4"
                                            />
                                            <p className="text-[10px] text-center text-muted-foreground uppercase font-bold tracking-widest opacity-60">
                                                Check back in to see the reduction!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-border">
                                <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Discard</Button>
                                <Button type="submit" className="px-6 font-semibold text-sm" disabled={isSubmitting}>
                                    {isSubmitting ? 'Syncing...' : 'Save Thought Record'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* History Table */}
            <Card className="border-border bg-card overflow-hidden">
                <div className="p-4 bg-muted border-b border-border flex justify-between items-center">
                    <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                        <History className="h-4 w-4 text-muted-foreground" /> Historical Records
                    </h3>
                    <Badge variant="outline" className="text-[10px] font-semibold">{records.length} Records</Badge>
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted">
                            <TableRow>
                                <TableHead className="w-[100px] text-[10px] font-semibold uppercase tracking-wider">Date</TableHead>
                                <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Situation</TableHead>
                                <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Emotion (Start/End)</TableHead>
                                <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Automatic Thought</TableHead>
                                <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Balanced View</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {records.length > 0 ? (
                                [...records].reverse().map((record, idx) => (
                                    <TableRow key={idx} className="group hover:bg-primary/[0.02] transition-colors">
                                        <TableCell className="text-xs font-medium">
                                            {(() => {
                                                try {
                                                    const d = new Date(record.date);
                                                    return isNaN(d.getTime()) ? 'N/A' : format(d, 'MMM d, yy');
                                                } catch (e) {
                                                    return 'N/A';
                                                }
                                            })()}<br />
                                            <span className="text-[10px] text-muted-foreground opacity-60 font-mono">
                                                Log #{records.length - idx}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-xs font-semibold">{record.situation}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-semibold text-primary">{record.emotion}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-destructive">{record.intensityScore}%</span>
                                                    <div className="w-12 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary" style={{ width: `${record.intensityScore}%` }} />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-green-500">{record.emotionAfterIntensity}%</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all">
                                            "{record.automaticThought}"
                                        </TableCell>
                                        <TableCell className="text-xs font-medium text-primary">
                                            {record.alternativeThought}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                                        No thought records found. Start your first cognitive challenge!
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
};

export default ThoughtRecord;
