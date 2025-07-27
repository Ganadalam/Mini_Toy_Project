const saveBtn = document.getElementById("save");
const textInput = document.getElementById("text");
const imageInput = document.getElementById("image-input");
const eraseBtn = document.getElementById("eraser-btn");
const destroyBtn = document.getElementById("destroy-btn");
const modeBtn = document.getElementById("mode-btn");
const colorOptions = Array.from(document.getElementsByClassName("color-option"));
const color = document.getElementById("color");
const lineWidth = document.getElementById("line-width");
const lineWidthDisplay = document.getElementById("line-width-display");

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const selectedColorCode = document.getElementById("selected-color-code");
const recentColorList = document.getElementById("recent-color-list");
const undoBtn = document.getElementById("undo-btn");
const redoBtn = document.getElementById("redo-btn");


// redo / undo
let undoStack = [];
let redoStack = [];


function saveState() {
  undoStack.push(canvas.toDataURL());
  // 새로운 행동이 시작되면 redo 초기화
  redoStack = [];
}

function restoreState(fromStack, toStack) {
  if (fromStack.length === 0) return;
  const snapshot = fromStack.pop();
  toStack.push(canvas.toDataURL());

  const img = new Image();
  img.src = snapshot;
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  };
}


/**
 * font 관련
 * */ 

const fontSizeInput = document.getElementById("font-size");
const fontFamilySelect = document.getElementById("font-family");
const boldBtn = document.getElementById("bold-btn");
const italicBtn = document.getElementById("italic-btn");
const underlineBtn = document.getElementById("underline-btn");

let isBold = false;
let isItalic = false;
let isUnderline = false;

const addPhotoBtn = document.getElementById("add-photo-btn");

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 800;
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// 캔버스 배경을 흰색으로 초기화
ctx.fillStyle = "white";
ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

ctx.lineWidth = lineWidth.value;
lineWidthDisplay.textContent = lineWidth.value + "px";


ctx.lineCap = "round";
ctx.lineJoin = "round";
ctx.strokeStyle = "#1abc9c";
ctx.fillStyle = "#1abc9c";

// ---------------- 상태 ----------------
let isPainting = false;
let isFilling = false;
let recentColors = [];

// ---------------- 그리기 ----------------
function getScaledCoordinates(event) {
  const boundingRect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / boundingRect.width;
  const scaleY = canvas.height / boundingRect.height;

  const x = (event.clientX - boundingRect.left) * scaleX;
  const y = (event.clientY - boundingRect.top) * scaleY;

  return { x, y };
}

function startPainting() {
  
  saveState();     
  isPainting = true;
}

function cancelPainting() {
  isPainting = false;
  ctx.beginPath();
}

function onMove(event) {
  const { x, y } = getScaledCoordinates(event);
  if (isPainting) {
    ctx.lineTo(x - 0.5, y - 0.5); // 🎯 미세 위치 보정만
    ctx.stroke();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x, y);
}

// ---------------- 선 굵기 & display  ----------------
function onLineWidthChange(event) {
  ctx.lineWidth = event.target.value;
  lineWidthDisplay.textContent = event.target.value + "px"; // 💡 표시 업데이트
}

// ---------------- 색상 변경 ----------------
function onColorChange(event) {
  const value = event.target.value;
  ctx.strokeStyle = value;
  ctx.fillStyle = value;
  updateSelectedColorDisplay(value);
  addToRecentColors(value);
  clearSelectedColor();
}

// 팔레트 클릭 시 색 선택
function onColorClick(event) {
  const target = event.currentTarget;
  const selectedColor = target.dataset.color;

  ctx.strokeStyle = selectedColor;
  ctx.fillStyle = selectedColor;
  color.value = selectedColor;

  updateSelectedColorDisplay(selectedColor);
  addToRecentColors(selectedColor);
  selectColorBox(target);
}

// 팔레트 내 input[type=color]에서 색 변경 시 반영
function onPaletteColorChange(event) {
  const newColor = event.target.value;
  const colorBox = event.target.parentElement;

  colorBox.style.backgroundColor = newColor;
  colorBox.dataset.color = newColor;

  ctx.strokeStyle = newColor;
  ctx.fillStyle = newColor;
  color.value = newColor;

  updateSelectedColorDisplay(newColor);
  addToRecentColors(newColor);
  selectColorBox(colorBox);
}

// 선택된 색상 표시
function updateSelectedColorDisplay(colorValue) {
  selectedColorCode.textContent = colorValue;
}

// 최근 색상 관리
function addToRecentColors(colorValue) {
  if (recentColors.includes(colorValue)) return;
  recentColors.unshift(colorValue);
  if (recentColors.length > 5) recentColors.pop();
  renderRecentColors();
}

function renderRecentColors() {
  recentColorList.innerHTML = "";
  recentColors.forEach((colorVal) => {
    const colorEl = document.createElement("div");
    colorEl.className = "recent-color";
    colorEl.style.backgroundColor = colorVal;
    colorEl.title = colorVal;
    colorEl.addEventListener("click", () => {
      ctx.strokeStyle = colorVal;
      ctx.fillStyle = colorVal;
      color.value = colorVal;
      updateSelectedColorDisplay(colorVal);
      clearSelectedColor();
    });
    recentColorList.appendChild(colorEl);
  });
}

// 팔레트 선택 효과
function selectColorBox(targetBox) {
  colorOptions.forEach((box) => box.classList.remove("selected"));
  targetBox.classList.add("selected");
}

function clearSelectedColor() {
  colorOptions.forEach((box) => box.classList.remove("selected"));
}

// ---------------- 모드 전환 ----------------
function onModeClick() {
  isFilling = !isFilling;
  modeBtn.innerText = isFilling ? "🖊️ Draw" : "🩸 Fill";
}

function onCanvasClick(event) {
  if (isFilling) {
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
}

// ---------------- 이미지 삽입 ----------------
function onFileChange(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = url;
  image.onload = function () {
    ctx.drawImage(image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    imageInput.value = null;
    URL.revokeObjectURL(url); // 메모리 정리
  };
}

// ---------------- 텍스트 삽입 ----------------
function onDoubleClick(event) {
   ctx.beginPath(); // 🎯 드로잉 경로 초기화 → 밑줄 방지

  const { x, y } = getScaledCoordinates(event);
  const text = textInput.value.trim();
  const fontSize = parseInt(fontSizeInput.value) || 24;
  const fontFamily = fontFamilySelect.value;

  if (text !== "") {
    ctx.save();
    ctx.lineWidth = 1;

    // 👉 스타일 반영
    const weight = isBold ? "bold" : "normal";
    const style = isItalic ? "italic" : "normal";
    ctx.font = `${style} ${weight} ${fontSize}px '${fontFamily}'`;

    ctx.fillStyle = color.value;
    ctx.fillText(text, x, y);
        ctx.restore();

    ctx.lineWidth = lineWidth.value; // 🖌 원래 굵기로 되돌리기


    // 👉 밑줄 수동 구현
    if (isUnderline) {
      const textWidth = ctx.measureText(text).width;
      const underlineY = y + 4; // text 기준 위치 조절
      const underlineHeight = 1.5;

      ctx.beginPath();
      ctx.moveTo(x, underlineY);
      ctx.lineTo(x + textWidth, underlineY);
      ctx.lineWidth = underlineHeight;
      ctx.strokeStyle = ctx.fillStyle;
      ctx.stroke();
    }

    ctx.restore();
    ctx.lineWidth = lineWidth.value; // 🎯 선 굵기 복원
  }
}


// ---------------- 도구 ----------------
function onDestroyClick() {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function onEraserClick() {
  ctx.strokeStyle = "white";
  isFilling = false;
  modeBtn.innerText = "🩸 Fill";
}

function onSaveClick() {
  try {
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "my_Drawing.png";
    document.body.appendChild(a); // DOM에 추가
    a.click();
    document.body.removeChild(a); // DOM에서 제거
  } catch (error) {
    console.error("Save failed:", error);
    alert("저장에 실패했습니다. 다시 시도해주세요.");
  }
}

// ---------------- 이벤트 바인딩 ----------------


// 🔠 텍스트 스타일 버튼 이벤트 바인딩
boldBtn.addEventListener("click", () => {
  isBold = !isBold;
  boldBtn.classList.toggle("active");
});

italicBtn.addEventListener("click", () => {
  isItalic = !isItalic;
  italicBtn.classList.toggle("active");
});

underlineBtn.addEventListener("click", () => {
  isUnderline = !isUnderline;
  underlineBtn.classList.toggle("active");
});

// 🔁 Undo / Redo 버튼 이벤트 바인딩 
undoBtn.addEventListener("click", () => restoreState(undoStack, redoStack)); 
redoBtn.addEventListener("click", () => restoreState(redoStack, undoStack));


canvas.addEventListener("mousemove", onMove);
canvas.addEventListener("mousedown", startPainting);
canvas.addEventListener("mouseup", cancelPainting);
canvas.addEventListener("mouseleave", cancelPainting);
canvas.addEventListener("click", onCanvasClick);
canvas.addEventListener("dblclick", onDoubleClick);

lineWidth.addEventListener("change", onLineWidthChange);
color.addEventListener("change", onColorChange);

colorOptions.forEach((colorBox) => {
  colorBox.addEventListener("click", onColorClick);
  const colorInput = colorBox.querySelector("input[type=color]");
  if (colorInput) {
    colorInput.addEventListener("change", onPaletteColorChange);
  }
});

modeBtn.addEventListener("click", onModeClick);
destroyBtn.addEventListener("click", onDestroyClick);
eraseBtn.addEventListener("click", onEraserClick);
saveBtn.addEventListener("click", onSaveClick);

// 사진 추가 관련 이벤트
addPhotoBtn.addEventListener("click", () => {
  imageInput.click();
});
imageInput.addEventListener("change", onFileChange);

// 초기 색상 설정
updateSelectedColorDisplay("#1abc9c");
