// 휴대폰 번호 입력 시 하이픈 자동 포맷
export function formatPhoneNumber(value: string) {
  const numbers = (value ?? '').replace(/\D/g, '').slice(0, 11);
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
}
