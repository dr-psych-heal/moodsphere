
import React from 'react';
import { Smile, Frown, Meh, Heart } from 'lucide-react';

interface MoodEmojiProps {
  score: number;
  size?: number;
}

const MoodEmoji: React.FC<MoodEmojiProps> = ({ score, size = 32 }) => {
  const getMoodInfo = (score: number) => {
    if (score >= 8) {
      return { icon: <Smile size={size} className="text-mood-great" />, label: 'Great' };
    } else if (score >= 6) {
      return { icon: <Smile size={size} className="text-mood-good" />, label: 'Good' };
    } else if (score >= 4) {
      return { icon: <Meh size={size} className="text-mood-okay" />, label: 'Okay' };
    } else if (score >= 2) {
      return { icon: <Frown size={size} className="text-mood-bad" />, label: 'Bad' };
    } else {
      return { icon: <Frown size={size} className="text-mood-terrible" />, label: 'Terrible' };
    }
  };

  const moodInfo = getMoodInfo(score);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="animate-pulse-light">
        {moodInfo.icon}
      </div>
      <span className="text-sm font-medium">{moodInfo.label}</span>
    </div>
  );
};

export default MoodEmoji;
