import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import designers from '../data/designers';
import type { DesignerType } from '../types';
import { getInitialConsonant } from '../utils';

const consonantList = [
  'ㄱ',
  'ㄴ',
  'ㄷ',
  'ㄹ',
  'ㅁ',
  'ㅂ',
  'ㅅ',
  'ㅇ',
  'ㅈ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
];

function Designer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredDesigners, setFilteredDesigners] = useState(designers);
  const [filter, setFilter] = useState<'all' | (typeof consonantList)[number]>(
    searchParams.get('cat') || 'all'
  );
  const [showDetail, setShowDetail] = useState<{ [key: string]: boolean }>(
    () => ({})
  );

  useEffect(() => {
    if (filter === 'all') {
      setFilteredDesigners(designers);
      setSearchParams({}); // 'all'일 때 쿼리 파라미터 제거
    } else {
      setFilteredDesigners(
        designers.filter(
          (designer) => getInitialConsonant(designer.name) === filter
        )
      );
      setSearchParams({ cat: filter }); // 'all'이 아닐 때만 쿼리 파라미터 설정
    }
  }, [filter, setSearchParams]);

  return (
    <div>
      <div className="w-full flex lg:text-[24px] text-[18px] justify-between overflow-x-auto scrollbar-hide">
        <div
          className={`cursor-pointer border-[1px] border-black lg:pr-4 px-2 mr-2 ${
            filter === 'all' ? 'bg-black text-[#BABCBE]' : ''
          }`}
          onClick={() => setFilter('all')}
        >
          All <span className="lg:inline-block hidden">Designers</span>
        </div>
        <div className="flex gap-2">
          {consonantList.map((consonant) => (
            <div
              className={`cursor-pointer border-[1px] border-black lg:px-2 px-1 ${
                filter === consonant ? 'bg-black text-[#BABCBE]' : ''
              }`}
              key={consonant}
              onClick={() => setFilter(consonant)}
            >
              {consonant}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4">
        {filteredDesigners.map((designer: DesignerType) => (
          <div
            className="border-t-[1px] border-black w-full lg:flex gap-2 py-6"
            key={designer.email}
          >
            <div
              className="lg:w-[200px] w-full lg:text-[20px] text-[18px] lg:mb-0 mb-4 flex justify-between cursor-pointer"
              onClick={() => {
                setShowDetail((prev) => {
                  const newState = { ...prev };
                  newState[designer.email] = !prev[designer.email];
                  return newState;
                });
              }}
            >
              <div>{designer.name}</div>
              <img
                src="./images/caret-down-light.svg"
                className="w-7 lg:hidden"
              />
            </div>
            <div className="flex-1 lg:text-[20px] text-[16px]">
              <div className="flex lg:mb-2">
                <div className="lg:w-[120px] w-[90px] mr-2">Email</div>
                <div>{designer.email}</div>
              </div>
              <div className="flex lg:text-[20px] text-[16px]">
                <div className="lg:w-[120px] w-[90px] mr-2">Instagram</div>
                <div>{designer.instagram}</div>
              </div>
            </div>
            <div className={`lg:flex hidden w-[550px] h-[170px] gap-2 mt-0`}>
              <div className="flex flex-1 gap-4">
                <div>Project 1</div>
                <div className="w-1/2 h-full bg-black" />
              </div>
              <div className="flex flex-1 gap-4">
                <div>Project 2</div>
                <div className="w-1/2 h-full bg-black" />
              </div>
            </div>
            <div
              className={`lg:hidden w-full duration-300 ${
                showDetail[designer.email] ? 'h-[170px]' : 'h-0'
              } flex gap-4 mt-4`}
            >
              <div className="w-1/2 h-full bg-black" />
              <div className="w-1/2 h-full bg-black" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Designer;
