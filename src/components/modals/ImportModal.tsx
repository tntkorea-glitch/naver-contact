'use client';

import { useState } from 'react';

export default function ImportModal({ onImport, onClose }: { onImport: (file: File) => void; onClose: () => void }) {
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setImporting(true);
      onImport(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">연락처 가져오기</h2>
        <p className="text-sm text-gray-500 mb-4">
          네이버 주소록 엑셀(.xlsx) 파일 또는 vCard(.vcf) 파일을 선택하세요.
          그룹 정보도 자동으로 가져옵니다.
        </p>
        {importing ? (
          <div className="p-8 text-center">
            <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-600 font-medium">{fileName}</p>
            <p className="text-xs text-gray-400 mt-1">대용량 파일은 시간이 걸릴 수 있습니다...</p>
          </div>
        ) : (
          <label className="block w-full p-8 border-2 border-dashed border-gray-300 rounded-xl text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
            <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-sm text-gray-600">.xlsx 또는 .vcf 파일 선택</span>
            <input type="file" accept=".xlsx,.xls,.vcf" onChange={handleFile} className="hidden" />
          </label>
        )}
        {!importing && (
          <button onClick={onClose} className="mt-4 w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
            닫기
          </button>
        )}
      </div>
    </div>
  );
}
