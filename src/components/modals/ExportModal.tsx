'use client';

import { useState } from 'react';
import type { Group } from '@/lib/types';

type ExportFormat = 'csv' | 'xlsx' | 'vcard';

interface ExportModalProps {
  groups: Group[];
  selectedIds: Set<string>;
  onExport: (format: ExportFormat, fields: string[], groupId?: string) => void;
  onClose: () => void;
}

const ALL_FIELDS = [
  { key: 'name', label: '이름', default: true },
  { key: 'phone', label: '전화번호', default: true },
  { key: 'email', label: '이메일', default: true },
  { key: 'group', label: '그룹명', default: false },
  { key: 'company', label: '회사·소속', default: true },
  { key: 'position', label: '직책', default: false },
  { key: 'address', label: '주소', default: false },
  { key: 'memo', label: '메모', default: false },
  { key: 'birthday', label: '생일·기념일', default: false },
];

export default function ExportModal({ groups, selectedIds, onExport, onClose }: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [fields, setFields] = useState<Set<string>>(
    new Set(ALL_FIELDS.filter(f => f.default).map(f => f.key))
  );
  const [scope, setScope] = useState<'all' | 'group' | 'selected'>( selectedIds.size > 0 ? 'selected' : 'all');
  const [groupId, setGroupId] = useState('');

  const toggleField = (key: string) => {
    setFields(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const toggleAll = () => {
    if (fields.size === ALL_FIELDS.length) {
      setFields(new Set(ALL_FIELDS.filter(f => f.default).map(f => f.key)));
    } else {
      setFields(new Set(ALL_FIELDS.map(f => f.key)));
    }
  };

  const handleExport = () => {
    onExport(format, [...fields], scope === 'group' ? groupId : undefined);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-5">연락처 저장 · 내보내기</h2>

        {/* 파일 형식 */}
        <div className="mb-5">
          <label className="text-sm font-medium text-gray-700 mb-2 block">파일 형식</label>
          <div className="space-y-2">
            {([
              ['csv', 'CSV', '아웃룩에 이용 가능. 쉼표로 구분한 텍스트 파일 형식'],
              ['xlsx', 'XLSX', '일반 주소록 서비스에 이용 가능. 엑셀 파일로 편집 가능'],
              ['vcard', 'Vcard', '애플 주소록, 구글 주소록에 이용 가능. 스마트폰과 연동 가능'],
            ] as const).map(([val, label, desc]) => (
              <label key={val} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${format === val ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input type="radio" name="format" value={val} checked={format === val} onChange={() => setFormat(val)} className="mt-0.5 accent-indigo-600" />
                <div>
                  <span className="text-sm font-medium text-gray-800">{label}</span>
                  <span className="text-xs text-gray-500 ml-2">{desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 항목 선택 */}
        {format !== 'vcard' && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">항목 선택</label>
              <button onClick={toggleAll} className="text-xs text-indigo-600 hover:underline">
                {fields.size === ALL_FIELDS.length ? '기본값' : '전체 선택'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {ALL_FIELDS.map(f => (
                <label key={f.key} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-colors ${fields.has(f.key) ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500'}`}>
                  <input type="checkbox" checked={fields.has(f.key)} onChange={() => toggleField(f.key)} className="accent-indigo-600 w-3.5 h-3.5" />
                  {f.label}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* 대상 선택 */}
        <div className="mb-5">
          <label className="text-sm font-medium text-gray-700 mb-2 block">대상 선택</label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="scope" checked={scope === 'all'} onChange={() => setScope('all')} className="accent-indigo-600" />
              전체
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="scope" checked={scope === 'group'} onChange={() => setScope('group')} className="accent-indigo-600" />
              그룹별
            </label>
            {selectedIds.size > 0 && (
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="scope" checked={scope === 'selected'} onChange={() => setScope('selected')} className="accent-indigo-600" />
                선택한 연락처 ({selectedIds.size}개)
              </label>
            )}
          </div>
          {scope === 'group' && (
            <select
              value={groupId}
              onChange={e => setGroupId(e.target.value)}
              className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">그룹 선택...</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">취소</button>
          <button onClick={handleExport} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">파일로 저장하기</button>
        </div>
      </div>
    </div>
  );
}
