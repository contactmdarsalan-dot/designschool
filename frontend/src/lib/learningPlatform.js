import { normalizeCourseCard } from './courseContent';

export const normalizeGamificationSummary = (payload = {}) => ({
  totalXp: Number(payload.totalXp || 0),
  level: Number(payload.level || 1),
  xpIntoLevel: Number(payload.xpIntoLevel || 0),
  xpForNextLevel: Number(payload.xpForNextLevel || 250),
  levelProgressPercent: Number(payload.levelProgressPercent || 0),
  streak: {
    current: Number(payload.streak?.current || 0),
    longest: Number(payload.streak?.longest || 0),
    lastActivityDate: payload.streak?.lastActivityDate || null,
  },
  badges: Array.isArray(payload.badges) ? payload.badges : [],
  recentXp: Array.isArray(payload.recentXp) ? payload.recentXp : [],
  skills: Array.isArray(payload.skills) ? payload.skills : [],
  resumeLearning: payload.resumeLearning || null,
  leaderboard: Array.isArray(payload.leaderboard) ? payload.leaderboard : [],
});

export const normalizeLearningPath = (path = {}) => {
  const courses = Array.isArray(path.courses) ? path.courses.map(normalizeCourseCard) : [];
  return {
    id: path.id || path.slug,
    title: path.title || 'Learning Path',
    slug: path.slug || '',
    description: path.description || '',
    persisted: path.persisted !== false,
    courseCount: Number(path.courseCount || courses.length || 0),
    progress: {
      started: Boolean(path.progress?.started),
      completedCourses: Number(path.progress?.completedCourses || 0),
      totalCourses: Number(path.progress?.totalCourses || courses.length || 0),
      progressPercent: Number(path.progress?.progressPercent || 0),
      completedAt: path.progress?.completedAt || null,
    },
    courses,
  };
};
