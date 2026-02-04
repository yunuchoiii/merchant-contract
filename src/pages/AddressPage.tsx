import { Assets, colors, Flex, httpClient, ListHeader, ListRow, NavigationBar, Spacing, TextFieldLine, Top } from 'ishopcare-lib';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { updateMerchant, useContractFormStore } from '../store/contractForm';
import type { AddressSearchItem } from '../types/contracts';

/** 주소 표기: "{city} {state} {street}" */
function formatAddressLine(item: { city: string; state: string; street: string }) {
  return [item.city, item.state, item.street].filter(Boolean).join(' ');
}

export function AddressPage() {
  const navigate = useNavigate();
  const setContractForm = useContractFormStore.setState;
  const currentAddress = useContractFormStore((s) => s.merchant.address);

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<AddressSearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setIsLoading(true);

    (async () => {
      try {
        const data = await httpClient.get<AddressSearchItem[]>('/api/addresses', {
          searchParams: { search: searchQuery.trim() },
        });
        if (!cancelled) setResults(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchQuery]);

  const handleSelectAddress = useCallback(
    (item: AddressSearchItem) => {
      updateMerchant(setContractForm, {
        address: {
          ...currentAddress,
          street: item.street,
          city: item.city,
          state: item.state,
          zipcode: item.zipcode,
        },
      });
      navigate(-1);
    },
    [setContractForm, currentAddress, navigate]
  );

  return (
    <>
      <NavigationBar
        left={<Assets.Icon name="icon-arrow-left-mono" shape={{ width: 32, height: 32 }} onClick={() => navigate(-1)} />}
      />
      <Top title={<Top.TitleParagraph>주소 검색하기</Top.TitleParagraph>} />
      <Spacing size={20} />
      <Flex direction="column" css={{ padding: '0 24px', gap: 20 }}>
        <TextFieldLine
          placeholder="주소"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Flex>
      {searchQuery.trim() && (
        <>
          <ListHeader
            title={
              <ListHeader.TitleParagraph fontWeight="bold" color={colors.grey600}>
                {isLoading ? '검색 중...' : `${searchQuery.trim()} 검색 결과`}
              </ListHeader.TitleParagraph>
            }
          />
          <Flex direction="column">
            {!isLoading &&
              results.map((item, index) => (
                <ListRow
                  key={`${item.zipcode}-${item.street}-${index}`}
                  contents={
                    <ListRow.Texts
                      type="2RowTypeA"
                      top={formatAddressLine(item)}
                      topProps={{ color: colors.grey800, fontWeight: 'semibold' }}
                      bottom={item.zipcode}
                      bottomProps={{ color: colors.grey500, fontWeight: 'medium' }}
                    />
                  }
                  onClick={() => handleSelectAddress(item)}
                />
              ))}
          </Flex>
        </>
      )}
    </>
  );
}
