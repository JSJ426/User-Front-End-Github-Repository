import { X } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree?: () => void;
}

export default function TermsModal({ isOpen, onClose, onAgree }: TermsModalProps) {
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
          <h2 className="text-xl font-bold text-gray-800">회원가입 동의 약관</h2>
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
            <section>
              <h3 className="font-bold text-gray-800 mb-2">제1조 (약관의 목적)</h3>
              <p className="text-sm leading-relaxed">
                본 약관은 AI 스마트 식단 설계 서비스(이하 "서비스")가 제공하는 서비스 이용과 관련하여 회원과 서비스 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-gray-800 mb-2">제2조 (회원가입 및 이용계약 체결)</h3>
              <div className="text-sm leading-relaxed space-y-2">
                <p>회원은 본 약관 및 개인정보 처리방침에 동의함으로써 회원가입을 신청할 수 있습니다.</p>
                <p>서비스는 회원가입 신청에 대해 승낙함으로써 이용계약이 체결됩니다.</p>
                <p>만 14세 미만의 경우 법정대리인의 동의가 필요할 수 있습니다.</p>
              </div>
            </section>

            <section>
              <h3 className="font-bold text-gray-800 mb-2">제3조 (수집하는 개인정보 항목)</h3>
              <p className="text-sm leading-relaxed mb-3">
                서비스는 원활한 운영을 위해 아래의 개인정보를 수집할 수 있습니다.
              </p>
              <div className="text-sm leading-relaxed space-y-3">
                <div>
                  <p className="font-semibold text-gray-800 mb-1">필수항목</p>
                  <ul className="list-disc list-inside pl-2 space-y-1">
                    <li>이름(또는 기관명)</li>
                    <li>아이디(이메일)</li>
                    <li>비밀번호</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 mb-1">선택항목</p>
                  <ul className="list-disc list-inside pl-2 space-y-1">
                    <li>소속 기관 정보</li>
                    <li>서비스 이용 관련 입력 데이터(설문, 후기 등)</li>
                  </ul>
                </div>
                <p className="text-xs text-gray-600">
                  ※ 서비스 이용 과정에서 자동 생성되는 로그 데이터가 수집될 수 있습니다.
                </p>
              </div>
            </section>

            <section>
              <h3 className="font-bold text-gray-800 mb-2">제4조 (개인정보의 이용 목적)</h3>
              <p className="text-sm leading-relaxed mb-2">
                수집된 개인정보는 다음 목적에 한하여 이용됩니다.
              </p>
              <ul className="list-disc list-inside pl-2 space-y-1 text-sm">
                <li>회원 식별 및 본인 확인</li>
                <li>서비스 제공 및 운영 관리</li>
                <li>잔반 데이터, 만족도, 선호도 분석을 위한 통계 처리</li>
                <li>서비스 개선 및 신규 기능 개발</li>
                <li>공지사항 및 중요 안내 전달</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-gray-800 mb-2">제5조 (개인정보 보관 및 이용 기간)</h3>
              <div className="text-sm leading-relaxed space-y-2">
                <p>회원 탈퇴 시 개인정보는 지체 없이 파기됩니다.</p>
                <p>단, 관계 법령에 따라 보관이 필요한 경우 해당 기간 동안 보관될 수 있습니다.</p>
              </div>
            </section>

            <section>
              <h3 className="font-bold text-gray-800 mb-2">제6조 (회원의 의무)</h3>
              <ul className="list-disc list-inside pl-2 space-y-1 text-sm">
                <li>회원은 정확한 정보를 제공해야 합니다.</li>
                <li>타인의 정보를 도용하거나 부정한 목적으로 서비스를 이용해서는 안 됩니다.</li>
                <li>서비스 운영을 방해하는 행위를 해서는 안 됩니다.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-gray-800 mb-2">제7조 (서비스의 변경 및 중단)</h3>
              <div className="text-sm leading-relaxed space-y-2">
                <p>서비스는 운영상 또는 기술상의 필요에 따라 서비스 내용을 변경할 수 있습니다.</p>
                <p>서비스 중단이 발생할 경우 사전에 공지함을 원칙으로 합니다.</p>
              </div>
            </section>

            <section>
              <h3 className="font-bold text-gray-800 mb-2">제8조 (책임의 제한)</h3>
              <p className="text-sm leading-relaxed">
                서비스는 천재지변, 시스템 장애 등 불가항력적인 사유로 인한 서비스 제공 불가에 대해 책임을 지지 않습니다.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-gray-800 mb-2">제9조 (약관의 변경)</h3>
              <div className="text-sm leading-relaxed space-y-2">
                <p>본 약관은 관련 법령을 위배하지 않는 범위에서 변경될 수 있습니다.</p>
                <p>변경 시 서비스 내 공지사항을 통해 사전 공지합니다.</p>
              </div>
            </section>

            <section>
              <h3 className="font-bold text-gray-800 mb-2">제10조 (분쟁 해결 및 관할 법원)</h3>
              <p className="text-sm leading-relaxed">
                본 약관과 관련된 분쟁은 대한민국 법을 따르며, 관할 법원은 서비스 운영자의 본점 소재지를 따릅니다.
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