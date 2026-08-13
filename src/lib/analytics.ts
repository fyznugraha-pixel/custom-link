import { 
  subHours, 
  subDays, 
  subMonths, 
  startOfHour, 
  startOfDay, 
  startOfWeek, 
  startOfMonth, 
  format,
  eachHourOfInterval,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval
} from 'date-fns';

export function getStartDate(range: string) {
  const now = new Date();
  switch (range) {
    case '24h': return subHours(now, 24);
    case '3d': return subDays(now, 3);
    case '7d': return subDays(now, 7);
    case '1m': return subMonths(now, 1);
    case '3m': return subMonths(now, 3);
    default: return new Date(2024, 0, 1); // Fallback start date for all
  }
}

function getFormat(range: string) {
  switch (range) {
    case '24h': return 'HH:00';
    case '3d': 
    case '7d': return 'MMM dd';
    case '1m': return 'MMM dd';
    case '3m': return 'MMM dd';
    default: return 'MMM yyyy';
  }
}

export function generateChartData(
  range: string, 
  startDate: Date, 
  users: any[], 
  links: any[], 
  clicks: any[],
  activeUsersData: any[],
  pageViews: any[],
  qrEvents: any[]
) {
  const now = new Date();
  let intervals: Date[] = [];

  // Generate continuous buckets
  if (range === '24h') {
    intervals = eachHourOfInterval({ start: startDate, end: now });
  } else if (range === '3d' || range === '7d' || range === '1m') {
    intervals = eachDayOfInterval({ start: startDate, end: now });
  } else if (range === '3m') {
    intervals = eachWeekOfInterval({ start: startDate, end: now });
  } else {
    intervals = eachMonthOfInterval({ start: startDate, end: now });
  }

  const dateFormat = getFormat(range);
  
  const dataMap = new Map();
  
  // Initialize all intervals with 0
  intervals.forEach(date => {
    let bucketDate;
    if (range === '24h') bucketDate = startOfHour(date);
    else if (range === '3m') bucketDate = startOfWeek(date);
    else if (range === 'all') bucketDate = startOfMonth(date);
    else bucketDate = startOfDay(date);
    
    const key = format(bucketDate, dateFormat);
    if (!dataMap.has(key)) {
      dataMap.set(key, { date: key, newUsers: 0, newLinks: 0, clicks: 0, activeUsers: 0, pageViews: 0, qrGenerated: 0 });
    }
  });

  const getBucketKey = (date: Date) => {
    let bucketDate;
    if (range === '24h') bucketDate = startOfHour(date);
    else if (range === '3m') bucketDate = startOfWeek(date);
    else if (range === 'all') bucketDate = startOfMonth(date);
    else bucketDate = startOfDay(date);
    return format(bucketDate, dateFormat);
  };

  // Populate Users
  users.forEach(u => {
    if (u.createdAt < startDate) return;
    const key = getBucketKey(u.createdAt);
    if (dataMap.has(key)) dataMap.get(key).newUsers += 1;
  });

  // Populate Links
  links.forEach(l => {
    if (l.createdAt < startDate) return;
    const key = getBucketKey(l.createdAt);
    if (dataMap.has(key)) dataMap.get(key).newLinks += 1;
  });

  // Populate Clicks
  clicks.forEach(c => {
    if (c.createdAt < startDate) return;
    const key = getBucketKey(c.createdAt);
    if (dataMap.has(key)) dataMap.get(key).clicks += 1;
  });

  // Populate Active Users
  activeUsersData.forEach(au => {
    if (au.lastActiveAt < startDate) return;
    const key = getBucketKey(au.lastActiveAt);
    if (dataMap.has(key)) dataMap.get(key).activeUsers += 1;
  });

  // Populate Page Views
  pageViews.forEach(pv => {
    if (pv.createdAt < startDate) return;
    const key = getBucketKey(pv.createdAt);
    if (dataMap.has(key)) dataMap.get(key).pageViews += 1;
  });

  // Populate QR Events
  qrEvents.forEach(qr => {
    if (qr.createdAt < startDate) return;
    const key = getBucketKey(qr.createdAt);
    if (dataMap.has(key)) dataMap.get(key).qrGenerated += 1;
  });

  return Array.from(dataMap.values());
}
