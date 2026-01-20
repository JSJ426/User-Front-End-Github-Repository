interface FooterProps {
  darkMode?: boolean;
}

export function Footer({ darkMode = false }: FooterProps) {
  return (
    <footer className={`mt-12 border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Contact 정보 */}
        <div className="mb-4">
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Contact : <a href="mailto:ktaivle@kt.com" className="hover:text-teal-600 transition">ktaivle@kt.com</a>
          </p>
        </div>

        {/* 링크 영역 */}
        <div className="mb-4">
          <div className={`flex flex-wrap items-center gap-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <a href="#" className="hover:text-teal-600 hover:underline transition">
              KT AIVLE EDU 개인정보 처리방침
            </a>
            <span className="text-gray-400">|</span>
            <a href="#" className="hover:text-teal-600 hover:underline transition">
              이용약관
            </a>
            <span className="text-gray-400">|</span>
            <a href="#" className="hover:text-teal-600 hover:underline transition">
              오픈소스라이선스
            </a>
          </div>
        </div>

        {/* 회사 정보 */}
        <div className={`space-y-1 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
          <p>(주)케이티 경기도 성남시 분당구 불정로 90 (정자동) | 대표자명 : 김영섭</p>
          <p>사업자등록번호 : 102-81-42945 | 통신판매업신고 : 2002-경기성남-0048</p>
          <p className="mt-2">Copyright© 2022 KT Corp. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}