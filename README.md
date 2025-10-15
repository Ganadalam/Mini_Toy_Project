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







2.5 Flash

