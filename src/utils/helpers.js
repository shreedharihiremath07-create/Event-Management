export const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });
};
export const formatCurrency = (amount) => {
  if (amount === 0) return 'FREE';
  return new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(amount);
};
export const getDaysLeft = (dateStr) => {
  const diff = new Date(dateStr) - new Date();
  return Math.max(0, Math.ceil(diff / (1000*60*60*24)));
};
export const getWeekendRange = (date = new Date()) => {
  const friday = new Date(date);
  const day = friday.getDay();
  const offset = day === 6 ? -1 : day === 0 ? -2 : (5 - day + 7) % 7;
  friday.setDate(friday.getDate() + offset);
  friday.setHours(0, 0, 0, 0);

  const sunday = new Date(friday);
  sunday.setDate(friday.getDate() + 2);
  sunday.setHours(23, 59, 59, 999);
  return { friday, sunday };
};
export const cn = (...classes) => classes.filter(Boolean).join(' ');
export const getLeadScoreColor = (score) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
};
export const getLeadScoreBg = (score) => {
  if (score >= 80) return 'bg-green-100';
  if (score >= 60) return 'bg-yellow-100';
  return 'bg-red-100';
};
