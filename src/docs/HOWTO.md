2) 문서별 “넣는 내용” 규칙 (가장 중요)
A) /docs/00_overview/README.md

프로젝트 한 장 소개서

제품 한 줄 설명

사용자/문제

핵심 범위(v1)

링크: PRD, Architecture, Design system, ADR index, Changelog

B) /docs/01_prd/v1.md, v2.md

“요구사항의 계약서”로 쓰기

Goals / Non-goals

Personas & Jobs-to-be-done

User stories (must/should/could)

Success metrics (예: 월간 활성 사용자, 입력 완료율, 재무 리포트 생성율 등)

Scope (In/Out)

Edge cases (금융앱은 여기가 가치)

Data requirements (필드, 정확도, 보존기간)

Compliance/Security requirements (PII, 암호화, 감사로그 등)

중요: PRD에는 “구현 방식”을 거의 쓰지 말고, “사용자 관점의 기대 결과”를 써

C) /docs/02_architecture/*

여기는 “현재 기준(현재 truth)” 문서
시간이 지나면 업데이트됨

system-overview.md: C4처럼 high-level 컴포넌트

data-model.md: 엔티티/관계/불변성(invariants)

api-contracts.md: request/response, versioning, idempotency

security.md: threat model, encryption, secret mgmt, 권한

observability.md: 로그/메트릭/트레이싱, SLO

performance.md: 병목 가정, 캐시, 인덱스, 페이징, 아카이빙

D) /docs/03_decisions (ADR)

여기가 “PM 문서화의 ROI 1등”

ADR은 절대 수정하지 않는 게 원칙
(수정 필요하면 “새 ADR로 뒤집기”)

ADR 템플릿(짧고 강하게)

Context: 왜 이 결정이 필요한가

Decision: 무엇을 결정했나 (1~3문장)

Alternatives: 고려한 옵션들 (짧게)

Consequences: 장점/단점/리스크/후속 작업

Links: 관련 PRD/PR/이슈

E) /docs/04_design

디자인을 “감”이 아니라 “규칙”으로 만들기 (금융앱 핵심)

design-system.md: 타이포, 스페이싱, 레이아웃 원칙

tokens.md: 색/폰트/spacing 토큰 정의

charts.md: 차트 규칙(색 의미, 축, 단위, 라벨)

accessibility.md: 대비/포커스/스크린리더/키보드

components.md: 컴포넌트 사용 규칙(Do/Don’t)

ux-flows/*: 핵심 플로우를 스크린샷/와이어 + 상태 전이로 기록

3) “변경 기록”을 잘 남기는 2가지 레이어
1) /docs/05_delivery/changelog.md

개발자용 누적 기록 (Keep a Changelog 스타일 추천)

Added / Changed / Fixed / Security

Breaking changes 명확히

2) /docs/05_delivery/release-notes/YYYY-MM-DD-vX.md

사용자/비즈니스용 릴리즈 노트 (짧고 읽기 쉽게)

4) PR이 문서를 자동으로 끌고 가게 만드는 장치
PR 템플릿에 “문서 링크”를 강제

/.github/pull_request_template.md 예시

What changed

Why (link ADR or issue)

Docs updated (checkbox)

PRD 영향 있으면 링크

Architecture 영향 있으면 링크

Decision이면 ADR 추가 링크

Risk / Rollback plan

Screenshots (UI면 필수)

이렇게 하면 “문서가 나중에”가 아니라 “코드랑 같이” 굴러가

5) 구체 예시 1개 (금융앱에서 흔한 결정)

예를 들어 “거래(Transaction) 수정 가능/불가능”은 나중에 분쟁/감사/정합성에 직결돼

PRD(v1.md)에는
“사용자는 거래를 정정할 수 있어야 한다” + “감사 추적이 남아야 한다”

Architecture(data-model.md)에는
“Transaction은 불변, 수정은 Adjustment(정정 레코드)로 표현”

ADR(adr-XXXX-ledger-data-model.md)에는
“불변 원장 + 정정 레코드 채택” 이유, 대안(직접 수정), 결과(리포팅 복잡도 증가) 기록

Changelog에는
“Added: adjustment transactions” 로 남김

이렇게 4군데에 역할별로 나눠 남기면, 6개월 뒤에도 “왜 이렇게 했더라?”가 안 생겨

6) 운영 팁 (문서가 방치되지 않게)

문서도 “코드처럼” 리뷰 대상

ADR은 “결정이 생길 때만” 추가, 남발 금지 (정말 중요한 선택만)

Architecture는 분기마다 “리프레시 PR” 한 번 (바뀐 것만)

Design 문서는 “토큰/차트/접근성” 같이 분쟁 잦은 규칙부터 먼저 고정