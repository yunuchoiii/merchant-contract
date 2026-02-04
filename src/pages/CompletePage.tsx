import { FixedBottomCTA, Flex, Spacing, Top } from 'ishopcare-lib';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { defaultContractForm, useContractFormStore } from '../store/contractForm';

export function CompletePage() {
  const navigate = useNavigate();
  const setContractForm = useContractFormStore.setState;

  useEffect(() => {
    setContractForm(defaultContractForm);
  }, [setContractForm]);

  return (
    <>
      <Top title={<Top.TitleParagraph>신청이 완료됐어요!</Top.TitleParagraph>} />
      <Spacing size={40} />
      <Flex alignItems="center" justifyContent="center">
        <img
          alt=""
          src="https://static.toss.im/lotties-common/check-spot-light-no-loop-apng.png"
          width={200}
          height={200}
        />
      </Flex>
      <FixedBottomCTA
        onClick={() => {
          navigate('/');
        }}
      >
        완료하기
      </FixedBottomCTA>
    </>
  );
}
