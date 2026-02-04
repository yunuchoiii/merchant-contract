import { create } from 'zustand';
import type { ContractBasicInfo, ContractMerchantInfo, ContractPayload } from '../types/contracts';

const defaultAddress = {
  street: '',
  city: '',
  state: '',
  zipcode: '',
  details: '',
} as const;

const defaultContractForm: ContractPayload = {
  basic: {
    name: '',
    phone: '',
    email: '',
  },
  merchant: {
    name: '',
    businessNumber: '',
    address: { ...defaultAddress },
  },
  businessCategory: '',
};

type ContractFormSetter = (fn: (prev: ContractPayload) => ContractPayload) => void;

/** contractFormState의 basic 필드만 부분 업데이트할 때 사용 */
export function updateBasic(set: ContractFormSetter, patch: Partial<ContractBasicInfo>) {
  set((prev) => ({ ...prev, basic: { ...prev.basic, ...patch } }));
}

/** contractFormState의 merchant 필드만 부분 업데이트할 때 사용 */
export function updateMerchant(set: ContractFormSetter, patch: Partial<ContractMerchantInfo>) {
  set((prev) => ({
    ...prev,
    merchant: {
      ...prev.merchant,
      ...patch,
      ...(patch.address && {
        address: { ...prev.merchant.address, ...patch.address },
      }),
    },
  }));
}

/** 계약 제출 폼 전역 상태 (ContractPayload) */
export const useContractFormStore = create<ContractPayload>(() => defaultContractForm);
