const FALLBACK_THUMBNAIL =
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop';

export const formatCurrency = (value) => {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount)) {
    return 'NPR 0';
  }

  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    maximumFractionDigits: Math.abs(amount % 1) > 0 ? 2 : 0,
  }).format(amount);
};

const normalizeDiscount = (course) => {
  const discount = Number(course?.discountPercentage ?? course?.pricing?.discountPercentage ?? 0);
  return Number.isFinite(discount) ? Math.max(0, discount) : 0;
};

const normalizePrice = (value) => {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? amount : 0;
};

const normalizeMentor = (mentor, index) => ({
  id: mentor?.id || `${mentor?.name || 'mentor'}-${index}`,
  name: mentor?.name || 'Mentor',
  role: mentor?.role || mentor?.expertise || mentor?.company || 'Platform Mentor',
  photoUrl: mentor?.photoUrl || mentor?.photo || '',
  bio: mentor?.bio || '',
  company: mentor?.company || '',
  experience: Number(mentor?.experience || 0),
  associated: Boolean(mentor?.associated),
});

export const getCourseIdentifier = (course) => {
  return course?.slug || course?._id || course?.id || '';
};

export const getCourseHref = (course) => {
  const identifier = getCourseIdentifier(course);
  return identifier ? `/courses/${identifier}` : '/courses';
};

export const normalizeCourseCard = (course) => {
  const price = normalizePrice(course?.price ?? course?.pricing?.price);
  const salePrice = normalizePrice(course?.salePrice ?? course?.pricing?.salePrice ?? price);
  const discount = normalizeDiscount(course);
  const thumbnail = course?.thumbnail || course?.metaData?.thumbnail || FALLBACK_THUMBNAIL;
  const tags = Array.isArray(course?.tags)
    ? course.tags
    : Array.isArray(course?.metaData?.displayTags)
      ? course.metaData.displayTags
      : [];

  return {
    id: course?._id || course?.id || course?.slug,
    identifier: getCourseIdentifier(course),
    href: getCourseHref(course),
    title: course?.title || 'Untitled Course',
    description: course?.shortDescription || course?.description || course?.metaData?.description || '',
    thumbnail,
    tags,
    category: course?.category || null,
    language: course?.languageLabel || course?.metaData?.language || course?.language || 'English',
    type: course?.type || 'live',
    price,
    salePrice,
    discount,
    isFeatured: Boolean(course?.isFeatured),
    featuredCard: {
      eyebrow: course?.featuredCard?.eyebrow || 'Featured Program',
      theme: course?.featuredCard?.theme || 'light',
      layout: course?.featuredCard?.layout || 'media-left',
      durationValue: course?.featuredCard?.durationValue || String(course?.durationWeeks || course?.duration_weeks || 0),
      durationLabel: course?.featuredCard?.durationLabel || 'Weeks',
      certificationValue: course?.featuredCard?.certificationValue || 'Yes',
      certificationLabel: course?.featuredCard?.certificationLabel || 'Certified',
      supportValue: course?.featuredCard?.supportValue || '24/7',
      supportLabel: course?.featuredCard?.supportLabel || 'Mentor Support',
    },
  };
};

const fallbackHeroHighlights = (course) => {
  const scheduleDays = course?.schedule?.days || '';
  const scheduleTime = course?.schedule?.time || '';
  return [
    { title: 'Schedule', value: [scheduleDays, scheduleTime].filter(Boolean).join(' ') || 'Schedule TBA' },
    { title: 'Certificate', value: course?.badgeText ? 'Yes' : 'Yes' },
    { title: 'Language', value: course?.languageLabel || course?.metaData?.language || 'English' },
    { title: 'Class', value: course?.type === 'self-paced' ? 'Self-paced' : 'Live Classes' },
  ];
};

export const normalizeCourseDetail = (course) => {
  const normalizedCard = normalizeCourseCard(course);
  const heroBullets = Array.isArray(course?.heroBullets)
    ? course.heroBullets
    : Array.isArray(course?.metaData?.outcomes)
      ? course.metaData.outcomes
      : [];
  const requirements = Array.isArray(course?.requirements)
    ? course.requirements
    : Array.isArray(course?.metaData?.requirements)
      ? course.metaData.requirements
      : [];
  const curriculum = Array.isArray(course?.curriculum)
    ? course.curriculum
    : Array.isArray(course?.metaData?.content)
      ? course.metaData.content
      : [];
  const faqs = Array.isArray(course?.faqs)
    ? course.faqs
    : Array.isArray(course?.metaData?.faqs)
      ? course.metaData.faqs
      : [];
  const comparison = course?.comparison || { left: [], right: [] };
  const technologySections = Array.isArray(course?.technologySections) ? course.technologySections : [];
  const builderItems = Array.isArray(course?.builderItems) ? course.builderItems : [];
  const certificatePoints = Array.isArray(course?.certificatePoints) ? course.certificatePoints : [];
  const mentorSpotlights = Array.isArray(course?.mentorSpotlights)
    ? course.mentorSpotlights.map((mentor, index) => normalizeMentor(mentor, index))
    : [];
  const platformMentors = Array.isArray(course?.platformMentors)
    ? course.platformMentors.map((mentor, index) => normalizeMentor(mentor, index))
    : [];

  return {
    ...normalizedCard,
    badgeText: course?.badgeText || 'Job Ready!',
    syllabusUrl: course?.syllabusUrl || '',
    mentor: course?.mentor || null,
    category: course?.category || null,
    schedule: course?.schedule || {},
    pricing: course?.pricing || {
      price: normalizedCard.price,
      salePrice: normalizedCard.salePrice,
      discountPercentage: normalizedCard.discount,
    },
    heroHighlights: Array.isArray(course?.heroHighlights) && course.heroHighlights.length > 0
      ? course.heroHighlights
      : fallbackHeroHighlights(course),
    heroBullets,
    requirements,
    targetAudience: Array.isArray(course?.targetAudience) ? course.targetAudience : [],
    curriculum,
    faqs,
    comparison,
    technologySections,
    builderItems,
    certificatePoints,
    platformMentors,
    mentorSpotlights,
    durationWeeks: course?.durationWeeks || course?.duration_weeks || normalizedCard.featuredCard.durationValue || 0,
    levelLabel: course?.levelLabel || course?.level || 'Beginner',
    displayVideo: course?.metaData?.displayVideo || '',
  };
};
