export function calculateIncentive(completedOrders) {
  if (completedOrders >= 100) return 2000;
  if (completedOrders >= 50) return 700;
  if (completedOrders >= 20) return 250;
  if (completedOrders >= 10) return 100;
  return 0;
}

export function calculateTotalEarnings({ basePay = 0, distancePay = 0, surge = 0, bonus = 0, tips = 0 }) {
  return Number(basePay) + Number(distancePay) + Number(surge) + Number(bonus) + Number(tips);
}
