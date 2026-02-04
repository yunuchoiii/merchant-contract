import {
  Assets,
  Checkbox,
  colors,
  FixedBottomCTA,
  Flex,
  httpClient,
  isHttpError,
  ListRow,
  NavigationBar,
  Spacing,
  Toast,
  Top,
} from 'ishopcare-lib';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useRedirectIfPrevStepIncomplete } from '../hooks/useRedirectIfPrevStepIncomplete';
import { useToast } from '../hooks/useToast';
import { useContractFormStore } from '../store/contractForm';
import type { BusinessCategoryItem } from '../types/contracts';
import { getBusinessNumberDigits, getPhoneDigits } from '../utils/form';

const SUBMIT_ERROR_MESSAGE = '제출에 실패했어요. 다시 시도해 주세요.';

export function BusinessInfoPage() {
  const navigate = useNavigate();

  // Form 전역 상태 관리
  const contractForm = useContractFormStore();
  const setContractForm = useContractFormStore.setState;

  // 업종 목록 상태 관리
  const [categories, setCategories] = useState<BusinessCategoryItem[]>([]);
  // 업종 목록 로딩 상태 관리
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // 토스트 상태 관리
  const { openToast, toastProps } = useToast();

  // 제출 상태 관리
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 이전 단계 폼이 비어 있으면 해당 단계 페이지로 replace 리다이렉트
  useRedirectIfPrevStepIncomplete('/business-info');

  // 선택된 업종 코드
  const selectedCode = contractForm.businessCategory ?? '';

  // 업종 목록 로딩
  useEffect(() => {
    let cancelled = false;
    setIsLoadingCategories(true);

    (async () => {
      try {
        const data = await httpClient.get<BusinessCategoryItem[]>('/api/business-categories');
        if (!cancelled) setCategories(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setCategories([]);
      } finally {
        if (!cancelled) setIsLoadingCategories(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // 업종 선택 핸들러
  const handleSelectCategory = useCallback(
    (code: string) => {
      setContractForm((prev) => ({ ...prev, businessCategory: code }));
    },
    [setContractForm]
  );

  // 제출 핸들러
  const handleSubmit = useCallback(async () => {
    if (!selectedCode.trim()) {
      openToast('업종을 선택해 주세요.');
      return;
    }

    const basic = contractForm.basic ?? {};
    const merchant = contractForm.merchant ?? {};
    const address = merchant.address ?? {};

    setIsSubmitting(true);
    try {
      await httpClient.post('/api/contracts', {
        json: {
          basic: {
            name: (basic.name ?? '').trim(),
            phone: getPhoneDigits(basic.phone ?? ''),
            email: (basic.email ?? '').trim(),
          },
          merchant: {
            name: (merchant.name ?? '').trim(),
            businessNumber: getBusinessNumberDigits(merchant.businessNumber ?? ''),
            address: {
              street: address.street ?? '',
              city: address.city ?? '',
              state: address.state ?? '',
              zipcode: address.zipcode ?? '',
              details: address.details ?? '',
            },
          },
          businessCategory: selectedCode,
        },
      });

      navigate('/complete');
    } catch (e) {
      const message = isHttpError(e) && e.message ? e.message : SUBMIT_ERROR_MESSAGE;
      openToast(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedCode, contractForm, navigate, openToast]);

  return (
    <>
      <NavigationBar
        left={<Assets.Icon name="icon-arrow-left-mono" shape={{ width: 32, height: 32 }} onClick={() => navigate(-1)} />}
      />
      <Top
        title={<Top.TitleParagraph>{(contractForm.merchant?.name ?? 'OOO')} 매장의 업종을 알려주세요</Top.TitleParagraph>}
        subtitle={<Top.SubTitleParagraph>업종에 따라 제출해야할 서류가 달라요.</Top.SubTitleParagraph>}
      />
      <Spacing size={20} />
      <Flex direction="column">
        {isLoadingCategories ? (
          <Flex css={{ padding: 24, justifyContent: 'center' }}>
            <Top.SubTitleParagraph color={colors.grey500}>업종 목록을 불러오는 중...</Top.SubTitleParagraph>
          </Flex>
        ) : (
          categories.map((item) => (
            <ListRow
              key={item.value}
              contents={
                <ListRow.Texts type="1RowTypeA" top={item.name} topProps={{ color: colors.grey700 }} />
              }
              right={
                <Checkbox.Line
                  checked={selectedCode === item.value}
                  onChange={() => handleSelectCategory(item.value)}
                  size={20}
                />
              }
              onClick={() => handleSelectCategory(item.value)}
            />
          ))
        )}
      </Flex>
      <FixedBottomCTA
        aria-label="제출하기 버튼"
        disabled={!selectedCode?.trim() || isSubmitting}
        onClick={handleSubmit}
      >
        제출하기
      </FixedBottomCTA>
      <Toast {...toastProps} />
    </>
  );
}
