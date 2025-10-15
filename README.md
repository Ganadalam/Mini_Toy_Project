🌟 1) Canvas - 웹 기반 드로잉 및 이미지 편집 도구
🖼️ 직관적인 드로잉 경험을 위한 Vanilla JavaScript Canvas 애플리케이션

🎯 목표	HTML5 Canvas API의 이해 및 다양한 기능 구현

🚀 프로젝트 개요 (Overview)

Canvas는 HTML5의 <canvas> $\text{API}$와 Vanilla JavaScript를 사용하여 개발된 웹 기반 드로잉 및 이미지 편집 도구입니다. 사용자에게 자유로운 드로잉, 텍스트 삽입, 이미지 업로드, 그리고 Undo/Redo 기능을 포함한 포괄적인 편집 환경을 제공하는 데 중점을 두었습니다.

✨ 주요 기능 (Key Features)

🎨 드로잉 제어: 
- 자유 드로잉: 마우스 이벤트(mousemove, mousedown)를 활용하여 $\text{ctx.lineTo}$와 $\text{ctx.stroke}$로 선을 그립니다.

- 선 굵기 조절: $\text{input[type="range"]}$를 통해 $\mathbf{1\text{px}}$부터 $\mathbf{20\text{px}}$까지 선 굵기를 조절하며 실시간으로 표시됩니다.

🌈 색상 관리:
- 다중 색상 선택: 사용자 지정 컬러 피커와 8개의 컬러 팔레트를 제공하며, 팔레트 색상 수정이 가능합니다.
- 최근 색상: 사용된 색상을 최대 5개까지 저장하고 다시 선택할 수 있는 리스트를 관리합니다.

🔄 상태 관리:	
- Undo / Redo:	캔버스의 DataURL 스냅샷을 $\text{undoStack}$과 $\text{redoStack}$에 저장하여 무제한 되돌리기/다시 실행 기능을 구현했습니다.

-채우기 / 지우기: 🩸 채우기 모드 토글 (isFilling 상태) 및 🧼 $\mathbf{흰색}$으로 그리는 지우개 기능을 제공합니다.

📝 텍스트 & 미디어:	
- 텍스트 삽입:	캔버스 더블 클릭 이벤트에 텍스트를 입력하며, B (굵게), I (기울임꼴), U (밑줄) 스타일을 적용할 수 있습니다.
  
- 밑줄 수동 구현: $\text{Canvas API}$에서 미지원하는 텍스트 밑줄 기능을 $\mathbf{ctx.measureText}$로 너비를 측정하고 $\mathbf{별도의 선 드로잉}$으로 구현했습니다.
  
- 이미지 업로드: 로컬 이미지를 불러와 $\text{ctx.drawImage}$를 사용하여 캔버스에 삽입합니다.
  
💾 결과물 저장: 
- .png 저장: $\text{canvas.toDataURL("image/png")}$을 이용해 작업물을 PNG 파일로 다운로드합니다.
  
💻 기술 스택 (Tech Stack)

언어:	
- Vanilla JavaScript: 프레임워크/라이브러리 없이 순수 $\text{JS}$로 동적 로직 및 이벤트 핸들링 구현
API:
- HTML5 Canvas API: 드로잉, 이미지 처리, 텍스트 렌더링 등 핵심 그래픽 작업 수행
웹:
- HTML5, CSS3:	캔버스 구조 정의 및 반응형 레이아웃 구현

⚙️ 실행 방법 (How to Run)
파일 다운로드: 프로젝트 파일을 로컬에 다운로드합니다.

실행: index.html 파일을 웹 브라우저로 엽니다. (별도의 웹 서버 구성 필요 없음)

사용: 좌측 및 우측 패널의 컨트롤러를 사용하여 드로잉을 시작하고 기능을 활용합니다.


2)  Project Nwitter - 트위터 클론 코딩
    
🚀 React & Firebase를 활용한 실시간 소셜 미디어 서비스 구현

🛠️ 목표: React 컴포넌트 구조화 및 $\text{Firebase}$를 이용한 백엔드 없이 풀스택 기능 구현

💻 기술 스택 (Tech Stack)

Frontend:
- React.js:	SPA (Single Page Application) 구현 및 컴포넌트 기반 UI 개발
- React Hooks: 상태 관리, 부수 효과 처리 등 $\text{React}$의 핵심 기능 활용
- React Router: 페이지 이동 및 보호된 페이지 (Protected Pages) 구현

Backend (BaaS):
- Firebase	백엔드 서버 구축 없이 인증, DB, 파일 저장소 기능 구현

DB & Storage:	
- Cloud Firestore	NoSQL 데이터베이스를 이용한 실시간 트윗 데이터 저장 및 읽기
- Firebase Storage	사용자 프로필 이미지, 트윗에 첨부된 이미지 파일 저장 및 관리

   (유료화로 수정 -> 기존: storage -> 현재: Base64 인코딩으로 저장)
  
인증:
- Firebase Authentication: 이메일/비밀번호, Google, Github 등 소셜 로그인 기능 구현
스타일링:
-	CSS Modules / Styled-Components: (선택적으로) 컴포넌트별 스타일링 및 UI/UX 개선

✨ 핵심 구현 기능 (Key Features)

👤 사용자 인증:
- 회원가입/로그인: 이메일과 비밀번호 기반 인증 시스템 구현
- 소셜 로그인: Google,Github 등 외부 서비스 계정을 이용한 간편 로그인 구현
- 로그인 상태 관리: 사용자의 인증 상태 변화를 실시간으로 감지하여 ProtectedPages (보호된 페이지) 구현

💬 트윗 CRUD:
- 트윗 생성 (Create): 텍스트와 $\mathbf{이미지 파일}$을 첨부하여 실시간으로 트윗을 작성
- 트윗 읽기 (Read): $\text{Firestore}$의 $\text{onSnapshot}$을 활용하여 $\mathbf{실시간}$으로 트윗 목록을 가져와 $\text{UI}$에 반영
- 트윗 수정 (Update): 작성자가 자신의 트윗 내용을 수정할 수 있는 기능 구현
- 트윗 삭제 (Delete): 트윗과 연결된 $\mathbf{이미지}$도 $\text{Firebase Storage}$에서 함께 삭제 처리

⚙️ 프로필 관리:
- 프로필 페이지: 사용자의 트윗 목록과 프로필 정보를 보여주는 페이지 구현
- 프로필 업데이트: 사용자 닉네임 및 아바타(프로필이미지) 변경 기능 구현 및 Storage 연동

