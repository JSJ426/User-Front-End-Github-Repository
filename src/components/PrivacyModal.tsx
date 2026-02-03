import { X } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree?: () => void;
}

export default function PrivacyModal({ isOpen, onClose, onAgree }: PrivacyModalProps) {
  if (!isOpen) return null;

  const handleAgree = () => {
    if (onAgree) {
      onAgree();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">개인정보 처리방침</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6 text-gray-700">
            <div className="text-sm leading-relaxed">
              <p className="mb-4">
                AI 스마트 식단 설계 서비스(이하 "서비스")는 「개인정보 보호법」 등 관련 법령을 준수하며, 이용자의 개인정보를 보호하기 위해 다음과 같은 개인정보 처리방침을 수립·공개합니다.
              </p>
            </div>

            <section>
              <h3 className="font-bold text-gray-800 mb-2">제1조 (개인정보의 처리 목적)</h3>
              <div className="text-sm leading-relaxed space-y-2">
                <p>
                  서비스는 다음의 목적을 위해 개인정보를 처리합니다.
                  처리한 개인정보는 아래 목적 이외의 용도로는 사용되지 않으며, 목적이 변경될 경우 사전 동의를 받습니다.
                </p>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li>회원 가입 및 본인 확인</li>
                  <li>서비스 제공 및 이용자 관리</li>
                  <li>급식 운영 데이터(잔반, 만족도, 선호도) 분석을 위한 통계 처리</li>
                  <li>서비스 개선, 품질 향상 및 신규 기능 개발</li>
                  <li>공지사항 및 중요 안내 전달</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="font-bold text-gray-800 mb-2">제2조 (처리하는 개인정보 항목)</h3>
              <div className="text-sm leading-relaxed space-y-3">
                <div>
                  <p className="font-semibold text-gray-800 mb-1">① 회원가입 시</p>
                  <div className="pl-3 space-y-2">
                    <div>
                      <p className="font-medium text-gray-700 mb-1">필수 항목</p>
                      <ul className="list-disc list-inside pl-2 space-y-1">
                        <li>이름(또는 기관명)</li>
                        <li>이메일(ID)</li>
                        <li>비밀번호</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 mb-1">선택 항목</p>
                      <ul className="list-disc list-inside pl-2 space-y-1">
                        <li>소속 기관(학교, 부서 등)</li>
                        <li>직책 또는 역할(관리자, 담당자 등)</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 mb-1">② 서비스 이용 과정에서 자동 수집되는 정보</p>
                  <ul className="list-disc list-inside pl-2 space-y-1">
                    <li>접속 로그, IP 주소</li>
                    <li>서비스 이용 기록</li>
                    <li>설문 응답, 후기 텍스트 등 사용자가 입력한 데이터</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-bold text-gray-800 mb-2">제3조 (개인정보의 처리 및 보유 기간)</h3>
              <ul className="list-disc list-inside pl-2 space-y-1 text-sm leading-relaxed">
                <li>개인정보는 수집·이용 목적이 달성될 때까지 보유·이용합니다.</li>
                <li>회원 탈퇴 시 개인정보는 지체 없이 파기됩니다.</li>
                <li>단, 관계 법령에 따라 일정 기간 보관이 필요한 경우 해당 기간 동안 보관합니다.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-gray-800 mb-2">제4조 (개인정보의 제3자 제공)</h3>
              <div className="text-sm leading-relaxed space-y-2">
                <p>
                  서비스는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.
                  다만, 다음의 경우에는 예외로 합니다.
                </p>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li>이용자가 사전에 동의한 경우</li>
                  <li>법령에 의해 제공이 요구되는 경우</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="font-bold text-gray-800 mb-2">제5조 (개인정보 처리의 위탁)</h3>
              <p className="text-sm leading-relaxed">
                서비스는 원활한 운영을 위해 개인정보 처리 업무의 일부를 외부에 위탁할 수 있습니다.
                이 경우 위탁 대상자와 위탁 업무 내용은 서비스 내 공지 또는 본 방침을 통해 안내합니다.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-gray-800 mb-2">제6조 (정보주체의 권리·의무 및 행사 방법)</h3>
              <div className="text-sm leading-relaxed space-y-2">
                <p>이용자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li>개인정보 열람 요청</li>
                  <li>개인정보 정정·삭제 요청</li>
                  <li>개인정보 처리 정지 요청</li>
                </ul>
                <p>권리 행사는 서비스 내 문의 기능 또는 운영자 이메일을 통해 요청할 수 있습니다.</p>
              </div>
            </section>

            <section>
              <h3 className="font-bold text-gray-800 mb-2">제7조 (개인정보의 파기 절차 및 방법)</h3>
              <ul className="list-disc list-inside pl-2 space-y-1 text-sm leading-relaxed">
                <li>개인정보는 처리 목적이 달성된 후 지체 없이 파기합니다.</li>
                <li>전자적 파일 형태의 정보는 복구 불가능한 방법으로 삭제합니다.</li>
                <li>종이 문서 형태의 정보는 분쇄 또는 소각을 통해 파기합니다.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-gray-800 mb-2">제8조 (개인정보의 안전성 확보 조치)</h3>
              <div className="text-sm leading-relaxed space-y-2">
                <p>서비스는 개인정보 보호를 위해 다음과 같은 조치를 취하고 있습니다.</p>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li>접근 권한 관리 및 최소화</li>
                  <li>개인정보 처리 시스템 접근 기록 관리</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="font-bold text-gray-800 mb-2">제9조 (개인정보 보호책임자)</h3>
              <div className="text-sm leading-relaxed space-y-1">
                <p>개인정보 보호 관련 문의는 아래 담당자에게 연락할 수 있습니다.</p>
                <p className="pl-2">개인정보 보호책임자: 김철수</p>
                <p className="pl-2">연락처: 1234@123.com</p>
              </div>
            </section>

            <section>
              <h3 className="font-bold text-gray-800 mb-2">제10조 (개인정보 처리방침의 변경)</h3>
              <p className="text-sm leading-relaxed">
                본 개인정보 처리방침은 법령 또는 서비스 정책 변경에 따라 수정될 수 있으며,
                변경 시 서비스 내 공지사항을 통해 사전 또는 즉시 공지합니다.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-gray-800 mb-2">부칙</h3>
              <p className="text-sm leading-relaxed">
                본 개인정보 처리방침은 정식 서비스 시작시부터 적용됩니다.
              </p>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            닫기
          </button>
          {onAgree && (
            <button
              onClick={handleAgree}
              className="flex-1 px-4 py-3 bg-[#00B3A4] text-white rounded-xl font-medium hover:bg-[#009688] transition-colors"
            >
              동의함
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
