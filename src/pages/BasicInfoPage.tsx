import { Assets, FixedBottomCTA, Flex, NavigationBar, Spacing, TextFieldLine, Toast, Top } from 'ishopcare-lib';
import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useToast } from '../hooks/useToast';
import { updateBasic, useContractFormStore } from '../store/contractForm';
import { formatPhoneNumber, isValidEmail } from '../utils/form';

const VALIDATION_MESSAGES = {
  name: '이름을 적어주세요.',
  phone: '휴대폰 번호를 적어주세요.',
  emailEmpty: '이메일을 적어주세요.',
  emailInvalid: '올바른 이메일 형식을 입력해주세요.',
} as const;

export function BasicInfoPage() {
  const navigate = useNavigate();

  // Form 전역 상태 관리
  const contractForm = useContractFormStore();
  const setContractForm = useContractFormStore.setState;
  const { name, phone, email } = contractForm.basic;

  // 토스트 상태 관리
  const { openToast, toastProps } = useToast();

  // 휴대폰 번호 변경 핸들러
  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateBasic(setContractForm, { phone: formatPhoneNumber(e.target.value) });
    },
    [setContractForm]
  );

  // 이메일 유효성 검사
  const isEmailValid = !email || isValidEmail(email);

  // 다음 버튼 클릭 핸들러
  const handleNext = useCallback(() => {
    if (!name?.trim()) {
      openToast(VALIDATION_MESSAGES.name);
      return;
    }
    if (!phone?.trim()) {
      openToast(VALIDATION_MESSAGES.phone);
      return;
    }
    if (!email?.trim()) {
      openToast(VALIDATION_MESSAGES.emailEmpty);
      return;
    }
    if (!isEmailValid) {
      openToast(VALIDATION_MESSAGES.emailInvalid);
      return;
    }
    navigate('/merchant-info');
  }, [name, phone, email, isEmailValid, navigate, openToast]);

  return (
    <>
      <NavigationBar
        left={<Assets.Icon name="icon-arrow-left-mono" shape={{ width: 32, height: 32 }} onClick={() => navigate(-1)} />}
      />
      <Top
        title={<Top.TitleParagraph>대표자 정보를 입력해주세요</Top.TitleParagraph>}
        subtitle={<Top.SubTitleParagraph>사업자등록증 상의 대표자 정보를 입력해야 해요.</Top.SubTitleParagraph>}
      />
      <Spacing size={20} />
      <Flex direction="column" css={{ padding: '0 24px', gap: 20 }}>
        <TextFieldLine
          type="text"
          placeholder="이름"
          value={name}
          onChange={(e) => updateBasic(setContractForm, { name: e.target.value })}
        />
        <TextFieldLine
          placeholder="휴대폰 번호"
          value={phone}
          onChange={handlePhoneChange}
          inputMode="numeric"
          maxLength={11}
        />
        <TextFieldLine
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => updateBasic(setContractForm, { email: e.target.value })}
        />
      </Flex>
      <FixedBottomCTA aria-label="다음 버튼" onClick={handleNext}>
        다음
      </FixedBottomCTA>
      <Toast {...toastProps} />
    </>
  );
}
