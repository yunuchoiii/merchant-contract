import type { ContractPayload } from '../types/contracts';

/** 휴대폰 번호를 000-0000-0000 형태로 포맷 (숫자만 허용, 최대 11자리) */
export const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};

/** 이메일 형식 유효성 검사 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const isValidEmail = (value: string): boolean => EMAIL_REGEX.test(value.trim());

/** 사업자등록번호를 XXX-XX-XXXXX 형태로 포맷 (숫자만 허용, 최대 10자리) */
export const formatBusinessNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
};

/** 포맷된 사업자등록번호에서 숫자만 추출 */
export const getBusinessNumberDigits = (formatted: string): string =>
  formatted.replace(/\D/g, '').slice(0, 10);

/** 포맷된 휴대폰 번호에서 숫자만 추출 */
export const getPhoneDigits = (formatted: string): string =>
  formatted.replace(/\D/g, '').slice(0, 11);

function isBasicFilled(form: ContractPayload): boolean {
  const b = form.basic ?? {};
  return Boolean(b.name?.trim() && b.phone?.trim() && b.email?.trim());
}

function isMerchantInfoFilled(form: ContractPayload): boolean {
  const m = form.merchant ?? {};
  return Boolean(m.name?.trim() && m.businessNumber?.trim());
}

function isAddressFilled(form: ContractPayload): boolean {
  const a = form.merchant?.address ?? {};
  return Boolean([a.city, a.state, a.street].filter(Boolean).join(' ').trim());
}

/** 현재 경로 진입 시 이전 단계 폼이 비어 있으면 리다이렉트할 경로 반환 */
export function getRedirectPathForIncompletePrevStep(
  form: ContractPayload,
  currentPath: string
): string | null {
  switch (currentPath) {
    case '/merchant-info':
      if (!isBasicFilled(form)) return '/basic-info';
      return null;
    case '/address':
      if (!isBasicFilled(form)) return '/basic-info';
      if (!isMerchantInfoFilled(form)) return '/merchant-info';
      return null;
    case '/business-info':
      if (!isBasicFilled(form)) return '/basic-info';
      if (!isMerchantInfoFilled(form)) return '/merchant-info';
      if (!isAddressFilled(form)) return '/address';
      return null;
    default:
      return null;
  }
}