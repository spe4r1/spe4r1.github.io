window.portfolio = {
  name: "SPE4R",
  headlineAccent: "portfolio.",
  about: "대구대학교에서 사이버보안을 전공하며 웹 해킹과 모바일 보안을 공부하고 있습니다. 특히 모의해킹에 관심이 있습니다. 화이트햇 스쿨에서는 Android 인텐트 취약점을 분석했습니다.",
  interests: ["웹 해킹", "모바일 보안", "모의해킹"],
  skills: [],
  resume: [
    { label: "학력·교육", entries: [
      { title: "대구대학교", detail: "사이버보안전공" },
      { title: "화이트햇 스쿨", detail: "4기 수료" },
      { title: "42경산" }
    ] },
    { label: "실무 경험", entries: [
      { title: "네이버 클라우드 MSP 파트너사", detail: "단기 인턴" },
      { title: "윈스테크넷 산학협력 프로젝트", detail: "Cloud IPS SaaS 개발" }
    ] },
    { label: "수상·선발", entries: [
      { title: "국가보안기술연구소장상", detail: "한국정보보호학회 논문 「역방향 추적 기반 Android intent 취약점 분석 기법」" },
      { title: "scriptCTF 일반부 2위" },
      { title: "스피어피싱 대응훈련 동상" },
      { title: "KISA 실전형 사이버훈련장", detail: "상위 30인 선발" }
    ] }
  ],
  contact: { email: "", github: "", blog: "" },
  projects: [
    {
      slug: "android-intent-paper", category: "논문",
      title: "역방향 추적 기반 Android intent 취약점 분석 기법",
      summary: "한국정보보호학회 논문 · 국가보안기술연구소장상 수상",
      image: "assets/access-boundary.webp", alt: "파란 공간에 겹쳐 선 사각 프레임",
      sections: [
        { heading: "연구 주제", body: "Android 앱의 구성요소는 인텐트(Intent)라는 메시지를 통해 동작을 요청합니다. 이 논문에서는 인텐트와 관련된 취약점을 분석하기 위해 처리 흐름을 역방향으로 추적하는 기법을 다뤘습니다." }
      ]
    },
    {
      slug: "whitehat-mobile-intent", category: "교육 프로젝트",
      title: "모바일 인텐트 취약점 분석",
      summary: "화이트햇 스쿨 4기에서 진행한 Android 보안 프로젝트",
      image: "assets/patch-review.webp", alt: "살구색 바탕 위에 놓인 두 장의 코드 변경 카드",
      sections: [
        { heading: "분석 대상", body: "화이트햇 스쿨 4기 과정에서 Android 앱이 인텐트로 요청을 주고받는 과정의 취약점을 분석했습니다." }
      ]
    },
    {
      slug: "cloud-ips-saas", category: "산학협력",
      title: "Cloud IPS SaaS 개발",
      summary: "윈스테크넷 산학협력 프로젝트 · 클라우드 침입방지시스템 개발",
      image: "assets/event-trace.webp", alt: "연녹색 공간에서 봉우리처럼 이어지는 신호 파형",
      sections: [
        { heading: "개발 대상", body: "윈스테크넷과의 산학협력 프로젝트에서 클라우드 침입방지시스템(IPS)을 서비스형 소프트웨어(SaaS)로 제공하는 개발 작업에 참여했습니다." }
      ]
    }
  ],
  // 기존 기술 기록의 개별 주소를 유지합니다.
  posts: [
    {
      slug: "document-permissions",
      category: "웹 보안",
      title: "공유 문서의 읽기 권한은 어디서 확인할까?",
      summary: "문서 한 장을 예로 들어 로그인한 사용자와 그 문서를 읽을 수 있는 사용자를 구분합니다.",
      image: "assets/access-boundary.webp",
      alt: "파란 공간에 겹쳐 선 일곱 개의 사각 프레임",
      sample: true,
      sections: [
        { heading: "같은 사용자, 다른 문서", body: "지민이 문서 A를 작성하고 동료에게 열람 권한을 주었다고 해보자. 로그인은 요청을 보낸 사람이 그 동료라는 사실을 확인한다. 문서 A를 읽어도 되는지는 공유 기록을 확인해야 답할 수 있다. 같은 사람이 문서 B를 열 때는 결과가 달라질 수 있다." },
        { heading: "누가, 무엇을, 어떻게", body: "서버가 판단할 때는 현재 사용자, 대상 문서, 요청한 동작을 한데 놓는다. 이 예에서 소유자는 문서를 읽고 수정할 수 있다. 열람을 허용받은 동료는 읽을 수 있다. 해당 문서와 관계를 확인할 수 없으면 요청을 거절한다. 화면에서 편집 버튼을 숨겨도 서버에서 확인해야 할 조건은 그대로다." },
        { heading: "공유를 해제한 뒤의 요청", body: "테스트에서는 공유 전과 후를 이어서 확인한다. 동료가 문서를 읽을 수 있는 상태에서 소유자가 공유를 해제한다. 다음 읽기 요청은 거절되어야 하고 소유자의 접근은 계속 허용되어야 한다. 이 두 결과를 한 쌍으로 기록하면 정책의 의도가 분명해진다." }
      ],
      source: { title: "OWASP · Authorization Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html" }
    },
    {
      slug: "reviewing-a-security-change",
      category: "코드 리뷰",
      title: "보안 패치의 테스트는 무엇을 증명할까?",
      summary: "만료된 초대장을 처리하는 작은 변경에서 거절 조건과 정상 동작을 함께 읽어봅니다.",
      image: "assets/patch-review.webp",
      alt: "살구색 바탕에 수정 전후의 코드 줄을 나타낸 두 장의 카드",
      sample: true,
      sections: [
        { heading: "수정 의도를 한 문장으로", body: "팀 초대장의 유효기간을 검사하는 변경을 생각해보자. 리뷰를 시작할 때 기대 동작을 먼저 적는다. 예를 들어 팀의 정책이 ‘서버 시각이 만료 시각에 도달하면 초대를 수락할 수 없다’라면, 리뷰어와 작성자는 바로 그 경계 시각을 기준으로 코드를 읽을 수 있다." },
        { heading: "경계의 양쪽을 읽기", body: "만료 직전의 초대장은 수락되고 만료 시각의 초대장은 거절되어야 한다. 테스트가 시간을 고정하면 실행 순간에 따라 두 결과가 뒤바뀌는 일을 피할 수 있다. 각각 어떤 초대장을 준비하고 어떤 결과를 기대하는지 테스트 이름만 보고 알 수 있게 적는다." },
        { heading: "응답 뒤에 남은 상태", body: "초대 수락에는 멤버십을 만드는 효과가 있다. 거절 응답을 확인한 다음 팀 멤버 목록도 살펴본다. 새 멤버가 추가되지 않았다는 확인까지 있어야 이 변경이 지키려는 조건을 테스트로 설명할 수 있다." }
      ],
      source: { title: "Google Engineering Practices · What to look for in a code review", url: "https://google.github.io/eng-practices/review/reviewer/looking-for.html#tests" }
    },
    {
      slug: "reading-sign-in-events",
      category: "로그 분석",
      title: "로그인 실패 한 줄에 무엇을 남길까?",
      summary: "실패 원인을 되짚는 데 필요한 이벤트 정보와 기록에서 제외할 값을 살펴봅니다.",
      image: "assets/event-trace.webp",
      alt: "연녹색 바탕에서 봉우리처럼 솟아오르는 여러 겹의 신호 파형",
      sample: true,
      sections: [
        { heading: "나중에 답해야 할 질문", body: "사용자가 ‘조금 전부터 로그인이 안 돼요’라고 알려왔다. 운영자가 확인할 것은 실패한 시각, 요청을 처리한 서비스, 실패의 종류다. 비밀번호 확인 단계에서 거절된 경우와 인증 서비스가 응답하지 않은 경우를 구분해 두면 조사할 범위를 좁힐 수 있다." },
        { heading: "흩어진 기록 연결하기", body: "한 번의 요청이 여러 서비스를 거칠 때는 같은 요청 식별자를 관련 이벤트에 남긴다. 예를 들어 인증 처리 기록과 오류 기록에서 같은 식별자를 찾으면 하나의 시도를 시간순으로 읽을 수 있다. 이 식별자는 인증에 사용하는 세션 토큰과 별도로 만든다." },
        { heading: "수집 범위를 작게 유지하기", body: "로그인 요청 본문에는 비밀번호가 들어갈 수 있고 헤더에는 인증 토큰이 실릴 수 있다. 이벤트 이름, 시각, 결과 분류, 요청 식별자처럼 목적에 맞는 항목을 골라 기록한다. 이 예에서 입력한 비밀번호나 토큰 원문은 실패 이유를 구분하는 데 필요하지 않다." }
      ],
      source: { title: "OWASP · Logging Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html#event-attributes" }
    }
  ]
};
