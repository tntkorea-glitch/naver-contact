'use client';

import { useState } from 'react';
import type { Contact } from '@/lib/types';

type Mode = 'exact' | 'similar';

export default function DuplicatesModal({ onMerge, onClose, onFetch }: {
  onMerge: (ids: string[], primaryId: string) => void;
  onClose: () => void;
  onFetch: (mode: Mode) => Promise<Contact[][]>;
}) {
  const [mode, setMode] = useState<Mode>('exact');
  const [groups, setGroups] = useState<Contact[][]>([]);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);

  const handleStart = async (m: Mode) => {
    setMode(m);
    setLoading(true);
    setStarted(true);
    const result = await onFetch(m);
    setGroups(result);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* 헤더 */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">중복연락처 정리</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 모드 선택 */}
        {!started ? (
          <div className="p-6 space-y-4">
            <button
              onClick={() => handleStart('exact')}
              className="w-full text-left p-5 border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
            >
              <h3 className="text-base font-semibold text-indigo-600 mb-1">01. 중복 연락처 정리하기</h3>
              <p className="text-sm text-gray-500">이메일, 전화번호, 이름이 동일하게 등록된 연락처 목록을 확인 후 정리하세요.</p>
            </button>
            <button
              onClick={() => handleStart('similar')}
              className="w-full text-left p-5 border border-gray-200 rounded-xl hover:border-teal-300 hover:bg-teal-50 transition-colors"
            >
              <h3 className="text-base font-semibold text-teal-600 mb-1">02. 유사 연락처 정리</h3>
              <p className="text-sm text-gray-500">이메일 주소 영역, 유선전화번호, 이름이 유사하게 등록된 연락처를 확인 후 정리하세요.</p>
            </button>
            <p className="text-xs text-gray-400">
              * 전체 연락처가 1,000건을 초과할 경우에는 대표 정보에 대해서만 검사를 진행합니다.
            </p>
          </div>
        ) : (
          <>
            {/* 탭 */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => handleStart('exact')}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                  mode === 'exact' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                중복 연락처
              </button>
              <button
                onClick={() => handleStart('similar')}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                  mode === 'similar' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                유사 연락처
              </button>
            </div>

            {/* 결과 */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-500">검사 중...</p>
                </div>
              ) : groups.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-medium">{mode === 'exact' ? '중복된' : '유사한'} 연락처가 없습니다!</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600">{groups.length}개 그룹 발견</p>
                  {groups.map((group, i) => (
                    <div key={i} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          {group.length}개의 {mode === 'exact' ? '중복' : '유사'} 연락처
                        </span>
                        <button
                          onClick={() => onMerge(group.map(c => c.id), group[0].id)}
                          className={`px-3 py-1.5 text-xs text-white rounded-lg ${
                            mode === 'exact' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-teal-600 hover:bg-teal-700'
                          }`}
                        >
                          첫 번째로 병합
                        </button>
                      </div>
                      {group.map(c => (
                        <div key={c.id} className="flex items-center gap-3 py-2 border-t border-gray-100">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                            {(c.last_name || c.first_name || '?')[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-800">
                              {[c.last_name, c.first_name].filter(Boolean).join(' ') || '이름 없음'}
                            </div>
                            <div className="text-xs text-gray-500">{c.phone} {c.email ? `| ${c.email}` : ''}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
