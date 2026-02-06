// 공통 비밀번호 정책 검사
// 규칙: 영문/숫자/특수문자( ( ) < > " ' ; 제외 ) 중 2종류 조합: 10~16자리
//      3종류 조합: 8~16자리

const DISALLOWED_SPECIAL = /[()<>"';]/;
const HAS_LETTER = /[A-Za-z]/;
const HAS_DIGIT = /\d/;
// 허용 특수문자: 공백 제외, 그리고 ()<>"'; 제외
const HAS_SPECIAL = /[^A-Za-z0-9\s]/;

export type PasswordPolicyResult = { ok: boolean; reason?: string };

export function checkPasswordPolicy(pw: string): PasswordPolicyResult {
  const s = (pw ?? '').trim();

  if (!s) return { ok: false, reason: '비밀번호를 입력해주세요.' };
  if (s.length < 8 || s.length > 16) {
    return { ok: false, reason: '비밀번호는 8~16자리로 입력해주세요.' };
  }
  if (DISALLOWED_SPECIAL.test(s)) {
    return { ok: false, reason: '특수문자 ( ) < > " \' ; 는 사용할 수 없습니다.' };
  }

  const types = [
    HAS_LETTER.test(s),
    HAS_DIGIT.test(s),
    HAS_SPECIAL.test(s),
  ].filter(Boolean).length;

  if (types < 2) {
    return { ok: false, reason: '영문/숫자/특수문자 중 2종류 이상 조합해야 합니다.' };
  }

  // 2종류면 10~16
  if (types === 2 && s.length < 10) {
    return { ok: false, reason: '2종류 조합은 10~16자리여야 합니다.' };
  }

  // 3종류면 8~16 (이미 길이 체크됨)
  return { ok: true };
}

export const PASSWORD_RULE_TOAST =
  '영문, 숫자, 특수문자( ( ) < > " \' ; 제외 )중 2종류를 조합하여 10~16자리 (3종류는 8~16자리)로 구성해야합니다.';

export const PASSWORD_RULE_TEXT =
  '비밀번호 생성규칙 \n영문, 숫자, 특수문자( ( ) < > " \' ; 제외 )중 2종류를 조합하여 10~16자리 (3종류는 8~16자리)로 구성할 수 있습니다.';
