import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useContractFormStore } from '../store/contractForm';
import { getRedirectPathForIncompletePrevStep } from '../utils/form';

/** 이전 단계 폼이 비어 있으면 해당 단계 페이지로 replace 리다이렉트 */
export function useRedirectIfPrevStepIncomplete(currentPath: string): void {
  const contractForm = useContractFormStore();
  const navigate = useNavigate();

  useEffect(() => {
    const redirectPath = getRedirectPathForIncompletePrevStep(contractForm, currentPath);
    if (redirectPath) navigate(redirectPath, { replace: true });
  }, [contractForm, currentPath, navigate]);
}
