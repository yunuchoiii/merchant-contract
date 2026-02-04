/**
 * 계약 제출 정보
 */
export interface ContractPayload {
  basic: ContractBasicInfo,
  merchant: ContractMerchantInfo,
  businessCategory: string;
}

/**
 * 대표자 정보
 */
export interface ContractBasicInfo {
  name: string;
  phone: string;
  email: string;
}

/**
 * 매장 정보
 */
export interface ContractMerchantInfo {
  name: string;
  businessNumber: string;
  address: ContractAddress;
}

/**
 * 주소 정보
 */
export interface ContractAddress {
  street: string;
  city: string;
  state: string;
  zipcode: string;
  details: string;
}

/** 주소 검색 API 응답 항목 */
export interface AddressSearchItem {
  street: string;
  city: string;
  state: string;
  zipcode: string;
}