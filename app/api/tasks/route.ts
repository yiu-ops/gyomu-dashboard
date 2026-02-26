import { NextResponse } from "next/server";
import { Task } from "@/lib/types";

const MOCK_TASKS: Task[] = [
  {
    category: "교원인사",
    task_name: "2026학년도 1학기 신규 전임교원 임용",
    description:
      "2026학년도 1학기 신규 전임교원 공개채용 및 임용 업무를 수행합니다. 채용 공고 게시, 서류 심사, 면접 및 학과 심의를 거쳐 최종 임용 후보자를 선정합니다. 임용 결격사유 조회 및 보직 임면 절차를 포함합니다.",
    precautions: [
      "교원인사위원회 심의를 반드시 거쳐야 합니다.",
      "결격사유 조회 결과는 공문 수신 후 처리하십시오.",
      "임용 예정일 2주 전까지 총장 결재 완료 필요.",
    ],
    timeline: [
      { date: "2026-01-10", action: "채용 공고 게시" },
      { date: "2026-02-05", action: "서류 심사 완료" },
      { date: "2026-02-20", action: "면접 심사 실시" },
      { date: "2026-03-01", action: "신규 교원 임용 예정" },
      { date: "2026-03-10", action: "임용 결격사유 조회 결과 수령" },
      { date: "2026-03-15", action: "최종 임용 처리 완료" },
    ],
    related_depts: ["교무처", "각 학과사무실", "인사팀", "법무팀"],
    deliverables: ["교원 임용 공고문", "서류심사 결과 보고서", "면접 심사 결과 보고서", "임용장"],
    _parse_status: "ok",
    _meta: { source_zip: "신규교원임용.zip", folder_in_zip: "DOC", filename: "2026학년도신규교원임용.hwp", extension: ".hwp" },
  },
  {
    category: "비전임조교관리",
    task_name: "2026학년도 1학기 비전임조교 위촉 관리",
    description:
      "2026학년도 1학기 비전임조교(대학원 조교, 시간제 조교) 위촉 및 관리 업무입니다. 학과별 조교 수요 파악, 위촉 서류 징수, 조교 연·병가 관리 및 면직 처리를 포함합니다.",
    precautions: [
      "위촉 기간은 학기 단위(3월~8월)로 처리합니다.",
      "연구비 지원 조교는 산학협력단과 협의 필요.",
    ],
    timeline: [
      { date: "2026-02-01", action: "학과별 조교 수요 조사" },
      { date: "2026-02-20", action: "위촉 서류 접수 마감" },
      { date: "2026-03-01", action: "비전임조교 위촉 발령" },
    ],
    related_depts: ["각 학과사무실", "대학원", "재무처"],
    deliverables: ["조교 위촉 명단", "위촉 동의서", "조교 연봉 지급 요청서"],
    _parse_status: "ok",
    _meta: { source_zip: "비전임조교위촉.zip", folder_in_zip: "ATTDOC", filename: "2026비전임조교위촉관리.hwp", extension: ".hwp" },
  },
  {
    category: "겸직관리",
    task_name: "2025학년도 후반기 전임교원 겸직 현황 실태조사",
    description:
      "교육부 지침에 따라 전임교원의 겸직 현황을 조사하고 결과를 보고합니다. 각 학과에서 겸직허가 신청서를 접수받아 검토하며, 허가된 겸직에 대한 보수 수령 현황을 포함하여 교육부에 제출합니다.",
    precautions: [
      "겸직 보수가 발생한 경우 다음 해 1월 31일까지 총장에게 보고해야 합니다.",
      "사외이사 겸직은 교육공무원법 제19조의2에 따릅니다.",
      "미신고 겸직 발견 시 징계 절차를 진행해야 합니다.",
    ],
    timeline: [
      { date: "2025-08-01", action: "겸직 현황 실태조사 공문 발송" },
      { date: "2025-08-31", action: "각 학과 제출 마감" },
      { date: "2025-09-15", action: "결과 취합 및 총장 결재" },
      { date: "2025-09-30", action: "교육부 제출" },
    ],
    related_depts: ["각 학과사무실", "대학원교학과", "교무처장"],
    deliverables: ["전임교원 겸직 현황 조사표", "겸직 결과 보고서"],
    _parse_status: "ok",
    _meta: { source_zip: "겸직현황실태조사.zip", folder_in_zip: "DOC", filename: "겸직현황실태조사결과보고.hwp", extension: ".hwp" },
  },
  {
    category: "교원업적평가",
    task_name: "2025학년도 교원 업적평가 실시",
    description:
      "2025학년도 전임교원 업적평가(연구, 교육, 봉사)를 실시합니다. 교원별 자기평가서 점수 입력, 학과 평가, 대학 평가위원회 심의를 거쳐 최종 결과를 통보합니다. 재임용 및 승진 기준 충족 여부를 함께 검토합니다.",
    precautions: [
      "자기평가서 제출 기한을 준수하지 않을 경우 불이익이 있을 수 있습니다.",
      "연구실적 입력 시 ISSN/ISBN 정보를 정확히 기재하십시오.",
      "평가 결과는 재임용 심사에 반영됩니다.",
    ],
    timeline: [
      { date: "2026-01-10", action: "업적평가 안내 공문 발송" },
      { date: "2026-01-31", action: "자기평가서 제출 마감" },
      { date: "2026-02-15", action: "학과별 1차 심의" },
      { date: "2026-02-28", action: "평가위원회 최종 심의" },
      { date: "2026-03-10", action: "업적평가 결과 통보" },
    ],
    related_depts: ["교무처", "각 학과사무실", "연구처", "+1"],
    deliverables: ["업적평가 자기평가서", "학과별 평가 결과 보고서", "최종 업적평가 결과 통보문"],
    _parse_status: "ok",
    _meta: { source_zip: "교원업적평가.zip", folder_in_zip: "DOC", filename: "2025교원업적평가실시.hwp", extension: ".hwp" },
  },
  {
    category: "교원연수출장",
    task_name: "2026학년도 상반기 교원 해외 연수 지원",
    description:
      "2026학년도 상반기 전임교원 해외 연수(학술대회 참가, 공동연구, 단기방문) 지원 업무입니다. 연수 신청 접수, 심사를 통한 지원 대상자 선정 및 여비 지급, 귀국 후 복명 보고 처리를 수행합니다.",
    precautions: [
      "학기 중 해외 출장은 교원인사위원회 심의 후 허가합니다.",
      "6개월 이상 장기 체류는 휴직 처리 대상입니다.",
      "타 기관에서 여비를 지급받는 경우 중복 지급하지 않습니다.",
    ],
    timeline: [
      { date: "2026-02-01", action: "해외 연수 신청 접수 시작" },
      { date: "2026-02-28", action: "신청 마감" },
      { date: "2026-03-15", action: "지원 대상자 선정 결과 통보" },
      { date: "2026-07-31", action: "귀국 복명 보고서 제출 마감" },
    ],
    related_depts: ["교무처", "연구처", "국제교류원", "+1"],
    deliverables: ["해외 연수 신청서", "연수 계획서", "귀국 복명 보고서"],
    _parse_status: "ok",
    _meta: { source_zip: "해외연수지원.zip", folder_in_zip: "ATTDOC", filename: "2026상반기교원해외연수지원.hwp", extension: ".hwp" },
  },
];

export async function GET() {
  return NextResponse.json(MOCK_TASKS);
}
