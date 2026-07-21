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

    if (member.lastPaymentDate) {
      const lastPayTime = new Date(member.lastPaymentDate + "T12:00:00").getTime();
      while (payDate.getTime() <= lastPayTime) {
        payDate.setDate(payDate.getDate() + 7);
      }
    }
  } else {
    // Mensal ou Quinzenal
    payDate = new Date(currentYear, currentMonth, payDayValue);
    
    // Se o pagamento deste mês ainda não chegou, avalia se o mês passado está pendente
    if (payDate.getTime() > now.getTime()) {
      const lastMonthPayDate = new Date(currentYear, currentMonth - 1, payDayValue);
      if (member.startDate) {
        const startDateTime = new Date(member.startDate + "T12:00:00").getTime();
        // Só considera o mês passado se ele já estava trabalhando na data
        if (startDateTime <= lastMonthPayDate.getTime()) {
           payDate = lastMonthPayDate;
        }
      }
    }

    // Avança o mês enquanto a data for menor ou igual ao último pagamento
    if (member.lastPaymentDate) {
      const lastPayTime = new Date(member.lastPaymentDate + "T12:00:00").getTime();
      while (payDate.getTime() <= lastPayTime) {
        payDate.setMonth(payDate.getMonth() + 1);
      }
    }
  }

  return payDate;
}
