export function getNextPayDate(member: any, now: Date = new Date()): Date | null {
  if (!member.paymentDate || !member.salaryAmount) return null;
  const payDayValue = parseInt(member.paymentDate);
  if (isNaN(payDayValue)) return null;

  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let payDate = new Date(now);
  payDate.setHours(0, 0, 0, 0);

  if (member.salaryType === "Semanal") {
    let diffDaysToPast = payDayValue - payDate.getDay();
    if (diffDaysToPast > 0) {
      diffDaysToPast -= 7;
    }
    payDate.setDate(payDate.getDate() + diffDaysToPast);

    let isPaid = false;
    if (member.lastPaymentDate) {
      const lastPayTime = new Date(member.lastPaymentDate + "T12:00:00").getTime();
      if (lastPayTime >= payDate.getTime()) {
        isPaid = true;
      }
    }

    if (isPaid) {
      payDate.setDate(payDate.getDate() + 7);
    }
  } else {
    // Mensal ou Quinzenal
    payDate = new Date(currentYear, currentMonth, payDayValue);
    
    if (payDate.getTime() > now.getTime()) {
      const lastMonthPayDate = new Date(currentYear, currentMonth - 1, payDayValue);
      let isLastMonthPaid = false;
      if (member.lastPaymentDate) {
        const lastPayTime = new Date(member.lastPaymentDate + "T12:00:00").getTime();
        if (lastPayTime >= lastMonthPayDate.getTime()) {
          isLastMonthPaid = true;
        }
      }
      if (!isLastMonthPaid && member.startDate) {
        const startDateTime = new Date(member.startDate + "T12:00:00").getTime();
        if (startDateTime <= lastMonthPayDate.getTime()) {
           payDate = lastMonthPayDate;
        }
      }
    } else {
      let isThisMonthPaid = false;
      if (member.lastPaymentDate) {
        const lastPayTime = new Date(member.lastPaymentDate + "T12:00:00").getTime();
        if (lastPayTime >= payDate.getTime()) {
          isThisMonthPaid = true;
        }
      }
      if (isThisMonthPaid) {
        payDate.setMonth(currentMonth + 1);
      }
    }
  }

  return payDate;
}
