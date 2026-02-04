import {
  Assets,
  FixedBottomCTA,
  Flex,
  NavigationBar,
  Spacing,
  TextFieldLine,
  Toast,
  Top,
  httpClient,
  isHttpError,
} from 'ishopcare-lib';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useRedirectIfPrevStepIncomplete } from '../hooks/useRedirectIfPrevStepIncomplete';
import { useToast } from '../hooks/useToast';
import { updateMerchant, useContractFormStore } from '../store/contractForm';
import { formatBusinessNumber, getBusinessNumberDigits } from '../utils/form';

const VALIDATION_MESSAGES = {
  storeName: '상호명을 적어주세요.',
  businessNumber: '사업자등록번호를 적어주세요.',
  address: '주소를 선택해주세요.',
  addressDetails: '상세주소를 적어주세요.',
} as const;

const MERCHANT_CONFLICTED_MESSAGE = '이미 계약된 매장이에요';

/** 주소 표기: "{city} {state} {street}" */
function getAddressDisplay(address: { street: string; city: string; state: string }) {
  return [address.city, address.state, address.street].filter(Boolean).join(' ');
}

export function MerchantInfoPage() {
  const navigate = useNavigate();

  // Form 전역 상태 관리
  const contractForm = useContractFormStore();
  const setContractForm = useContractFormStore.setState;
  const { name, businessNumber, address } = contractForm.merchant;

  // 주소 표기
  const addressDisplay = useMemo(() => getAddressDisplay(address), [address]);

  const { openToast, toastProps } = useToast();

  // 제출 상태 관리
  const [isSubmitting, setIsSubmitting] = useState(false);

  useRedirectIfPrevStepIncomplete('/merchant-info');

  // 주소 유효성 검사
  const hasAddress = Boolean(addressDisplay.trim());
  // 폼 유효성 검사
  const isFormValid =
    Boolean(name?.trim()) &&
    Boolean(businessNumber?.trim()) &&
    hasAddress &&
    Boolean(address.details?.trim());

  // 다음 버튼 클릭 핸들러
  const handleNext = useCallback(async () => {
    if (!name?.trim()) {
      openToast(VALIDATION_MESSAGES.storeName);
      return;
    }
    if (!businessNumber?.trim()) {
      openToast(VALIDATION_MESSAGES.businessNumber);
      return;
    }
    if (!hasAddress) {
      openToast(VALIDATION_MESSAGES.address);
      return;
    }
    if (!address.details?.trim()) {
      openToast(VALIDATION_MESSAGES.addressDetails);
      return;
    }

    setIsSubmitting(true);
    try {
      await httpClient.post('/api/merchants/validation', {
        json: {
          name: name.trim(),
          businessNumber: getBusinessNumberDigits(businessNumber),
          address: {
            street: address.street,
            city: address.city,
            state: address.state,
            zipcode: address.zipcode,
          },
        },
      });
      navigate('/business-info');
    } catch (e) {
      if (isHttpError(e) && e.code === 'MERCHANT_CONFLICTED') {
        openToast(MERCHANT_CONFLICTED_MESSAGE);
      } else {
        openToast('확인에 실패했어요. 다시 시도해 주세요.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [name, businessNumber, hasAddress, address, navigate, openToast]);

  const handleBusinessNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateMerchant(setContractForm, { businessNumber: formatBusinessNumber(e.target.value) });
    },
    [setContractForm]
  );

  return (
    <>
      <NavigationBar
        left={<Assets.Icon name="icon-arrow-left-mono" shape={{ width: 32, height: 32 }} onClick={() => navigate(-1)} />}
      />
      <Top
        title={<Top.TitleParagraph>매장 정보를 입력주세요</Top.TitleParagraph>}
        subtitle={<Top.SubTitleParagraph>{contractForm.basic.name || 'OOO'}님의 매장 정보가 필요해요.</Top.SubTitleParagraph>}
      />
      <Spacing size={20} />
      <Flex direction="column" css={{ padding: '0 24px', gap: 20 }}>
        <TextFieldLine
          placeholder="상호명"
          value={name}
          onChange={(e) => updateMerchant(setContractForm, { name: e.target.value })}
        />
        <TextFieldLine
          placeholder="사업자등록번호"
          value={businessNumber}
          onChange={handleBusinessNumberChange}
          inputMode="numeric"
          maxLength={12}
        />
        <TextFieldLine
          placeholder="주소"
          value={addressDisplay}
          readOnly
          onClick={() => navigate('/address')}
        />
        <TextFieldLine
          placeholder="상세주소"
          value={address.details}
          onChange={(e) => updateMerchant(setContractForm, { address: { ...address, details: e.target.value } })}
        />
      </Flex>
      <FixedBottomCTA
        aria-label="다음 버튼"
        disabled={!isFormValid || isSubmitting}
        onClick={handleNext}
      >
        다음
      </FixedBottomCTA>
      <Toast {...toastProps} />
    </>
  );
}
