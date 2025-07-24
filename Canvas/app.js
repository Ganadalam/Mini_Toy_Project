//undo, redo (X) , font 적용 (X), px 수정 (X)
const saveBtn = document.getElementById("save");
const textInput = document.getElementById("text");
const imageInput = document.getElementById("image-input");
const eraseBtn = document.getElementById("eraser-btn");
const destroyBtn = document.getElementById("destroy-btn");
const modeBtn = document.getElementById("mode-btn");
const colorOptions = Array.from(document.getElementsByClassName("color-option"));
const color = document.getElementById("color");
const lineWidth = document.getElementById("line-width");
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const selectedColorCode = document.getElementById("selected-color-code");
const recentColorList = document.getElementById("recent-color-list");

const fontSizeInput = document.getElementById("font-size");
const addPhotoBtn = document.getElementById("add-photo-btn");

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 800;
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// 캔버스 배경을 흰색으로 초기화
ctx.fillStyle = "white";
ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

ctx.lineWidth = lineWidth.value;
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
  isPainting = true;
}

function cancelPainting() {
  isPainting = false;
  ctx.beginPath();
}

function onMove(event) {
  const { x, y } = getScaledCoordinates(event);
  if (isPainting) {
    ctx.lineTo(x, y);
    ctx.stroke();
    return;
  }
  ctx.moveTo(x, y);
}

// ---------------- 선 굵기 ----------------
function onLineWidthChange(event) {
  ctx.lineWidth = event.target.value;
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
  const { x, y } = getScaledCoordinates(event);
  const text = textInput.value.trim();
  const fontSize = parseInt(fontSizeInput.value) || 24;

  if (text !== "") {
    ctx.save();
    ctx.lineWidth = 1;
    ctx.font = `${fontSize}px sans-serif`;
    ctx.fillStyle = color.value;
    ctx.fillText(text, x, y);
    ctx.restore();
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



// (1) document.addEventListener("DOMContentLoaded", () => {
//   // 1. DOM 요소 선택
//   const canvas = document.querySelector("canvas");
//   const ctx = canvas.getContext("2d");

//   const saveBtn = document.getElementById("save");
//   const textInput = document.getElementById("text");
//   const imageInput = document.getElementById("image-input");
//   const eraseBtn = document.getElementById("eraser-btn");
//   const destroyBtn = document.getElementById("destroy-btn");
//   const modeBtn = document.getElementById("mode-btn");
//   const colorOptions = Array.from(document.getElementsByClassName("color-option"));
//   const color = document.getElementById("color");
//   const lineWidth = document.getElementById("line-width");
//   const lineWidthDisplay = document.getElementById("line-width-display");
//   const selectedColorCode = document.getElementById("selected-color-code");
//   const recentColorList = document.getElementById("recent-color-list");
//   const fontSizeInput = document.getElementById("font-size");
//   const fontFamilySelect = document.getElementById("font-family");
//   const addPhotoBtn = document.getElementById("add-photo-btn");
//   const redoBtn = document.getElementById("redo-btn");
//   const undoBtn = document.getElementById("undo-btn");
//   const boldBtn = document.getElementById("bold-btn");
//   const italicBtn = document.getElementById("italic-btn");
//   const underlineBtn = document.getElementById("underline-btn");

//   // 2. 초기 설정
//   const CANVAS_WIDTH = 800;
//   const CANVAS_HEIGHT = 800;
//   canvas.width = CANVAS_WIDTH;
//   canvas.height = CANVAS_HEIGHT;
//   ctx.fillStyle = "white";
//   ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
//   ctx.lineWidth = lineWidth.value;
//   ctx.lineCap = "round";
//   ctx.lineJoin = "round";
//   ctx.strokeStyle = color.value;
//   ctx.fillStyle = color.value;

//   let isPainting = false;
//   let isFilling = false;
//   let recentColors = [];
//   let redoStack = [];
//   let undoStack = [];
//   let textStyles = {
//     bold: false,
//     italic: false,
//     underline: false
//   };

//   // ... 👇 여기에 함수 정의도 넣고
//   // getScaledCoordinates, startPainting, onMove 등등
// function getScaledCoordinates(event) {
//   const boundingRect = canvas.getBoundingClientRect();
//   const scaleX = canvas.width / boundingRect.width;
//   const scaleY = canvas.height / boundingRect.height;

//   const x = (event.clientX - boundingRect.left) * scaleX;
//   const y = (event.clientY - boundingRect.top) * scaleY;

//   return { x, y };
// }

// function startPainting(event) {
//   isPainting = true;
//   const { x, y } = getScaledCoordinates(event);
//   ctx.beginPath(); // 선을 새로 시작
//   ctx.moveTo(x, y); // 시작 위치 설정
//   saveState();
// }
// function onMove(event) {
//   const { x, y } = getScaledCoordinates(event);
//   if (isPainting) {
//     ctx.lineTo(x, y);
//     ctx.stroke();
//   }
// }

//   // ... 👇 마지막에 이벤트 바인딩
//   canvas.addEventListener("mousemove", onMove);
//   canvas.addEventListener("mousedown", startPainting);
//   canvas.addEventListener("mouseup", cancelPainting);
//   canvas.addEventListener("mouseleave", cancelPainting);
//   canvas.addEventListener("click", onCanvasClick);
//   canvas.addEventListener("dblclick", onDoubleClick);

//   lineWidth.addEventListener("input", onLineWidthChange);
//   color.addEventListener("change", onColorChange);

//   colorOptions.forEach((colorBox) => {
//     colorBox.addEventListener("click", onColorClick);
//     const colorInput = colorBox.querySelector("input[type=color]");
//     if (colorInput) {
//       colorInput.addEventListener("change", onPaletteColorChange);
//     }
//   });

//   modeBtn.addEventListener("click", onModeClick);
//   destroyBtn.addEventListener("click", onDestroyClick);
//   eraseBtn.addEventListener("click", onEraserClick);
//   saveBtn.addEventListener("click", onSaveClick);
//   addPhotoBtn.addEventListener("click", () => imageInput.click());
//   imageInput.addEventListener("change", onFileChange);
//   redoBtn.addEventListener("click", redo);
//   undoBtn.addEventListener("click", undo);

//   updateSelectedColorDisplay(color.value);
//   saveState(); // 초기 상태 저장
// });


// //"#1abc9c"
// // ---------------- 상태 ----------------

// // ---------------- 그리기 ----------------


// function cancelPainting() {
//   isPainting = false;
//   ctx.beginPath();
// }



// // ---------------- 선 굵기 ----------------
// function onLineWidthChange(event) {
//   const value = event.target.value;
//   ctx.lineWidth = value;
//   lineWidthDisplay.textContent = value + "px";
// }

// // ---------------- Undo/Redo 기능 ----------------
// function saveState() {
//   undoStack.push(canvas.toDataURL());
//   if (undoStack.length > 20) undoStack.shift(); // 최대 20개 상태만 유지
//   redoStack = []; // 새로운 액션 후에는 redo 스택 클리어
// }

// function undo() {
//   if (undoStack.length > 1) {
//     redoStack.push(undoStack.pop());
//     const previousState = undoStack[undoStack.length - 1];
//     restoreCanvas(previousState);
//   }
// }

// function redo() {
//   if (redoStack.length > 0) {
//     const nextState = redoStack.pop();
//     undoStack.push(nextState);
//     restoreCanvas(nextState);
//   }
// }

// function restoreCanvas(dataURL) {
//   const img = new Image();
//   img.onload = function() {
//     ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
//     ctx.drawImage(img, 0, 0);
//   };
//   img.src = dataURL;
// }

// // ---------------- 색상 변경 ----------------
// function onColorClick(event) {
//   const target = event.currentTarget;
//   const selectedColor = target.dataset.color;

//   ctx.strokeStyle = selectedColor;
//   ctx.fillStyle = selectedColor;
//   color.value = selectedColor; 

//   updateSelectedColorDisplay(selectedColor);
//   addToRecentColors(selectedColor);
//   clearSelectedColor(target);
// }

// // 팔레트 내 input[type=color]에서 색 변경 시 반영
// function onPaletteColorChange(event) {
//   const newColor = event.target.value;
//   const colorBox = event.target.parentElement;

//   colorBox.style.backgroundColor = newColor;
//   colorBox.dataset.color = newColor;

//   ctx.strokeStyle = newColor;
//   ctx.fillStyle = newColor;
//   color.value = newColor;

//   updateSelectedColorDisplay(newColor);
//   addToRecentColors(newColor);
//   selectColorBox(colorBox);
// }

// // 선택된 색상 표시
// function updateSelectedColorDisplay(colorValue) {
//   selectedColorCode.textContent = colorValue;
// }

// // 최근 색상 관리
// function addToRecentColors(colorValue) {
//   if (recentColors.includes(colorValue)) return;
//   recentColors.unshift(colorValue);
//   if (recentColors.length > 5) recentColors.pop();
//   renderRecentColors();
// }

// function renderRecentColors() {
//   recentColorList.innerHTML = "";
//   recentColors.forEach((colorVal) => {
//     const colorEl = document.createElement("div");
//     colorEl.className = "recent-color";
//     colorEl.style.backgroundColor = colorVal;
//     colorEl.title = colorVal;
//     colorEl.addEventListener("click", () => {
//       ctx.strokeStyle = colorVal;
//       ctx.fillStyle = colorVal;
//       color.value = colorVal;
//       updateSelectedColorDisplay(colorVal);
//       clearSelectedColor();
//     });
//     recentColorList.appendChild(colorEl);
//   });
// }

// // 팔레트 선택 효과
// function selectColorBox(targetBox) {
//   colorOptions.forEach((box) => box.classList.remove("selected"));
//   targetBox.classList.add("selected");
// }

// function clearSelectedColor() {
//   colorOptions.forEach((box) => box.classList.remove("selected"));
// }

// function onColorChange(event) {
//   const selectedColor = event.target.value;
//   ctx.strokeStyle = selectedColor;
//   ctx.fillStyle = selectedColor;

//   updateSelectedColorDisplay(selectedColor);
//   addToRecentColors(selectedColor);
//   clearSelectedColor();
// }


// // ---------------- 모드 전환 ----------------
// function onModeClick() {
//   isFilling = !isFilling;
//   modeBtn.innerText = isFilling ? "🖊️ Draw" : "🩸 Fill";
// }

// function onCanvasClick(event) {
//   if (isFilling) {
//     ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
//     saveState(); // Fill 후 상태 저장
//   }
// }

// // ---------------- 이미지 삽입 ----------------
// function onFileChange(event) {
//   const file = event.target.files[0];
//   if (!file) return;

//   const url = URL.createObjectURL(file);
//   const image = new Image();
//   image.src = url;

//   image.onload = () => {
//     ctx.drawImage(image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); // 캔버스 크기에 맞게 그림
//     URL.revokeObjectURL(url); // 메모리 누수 방지
//     imageInput.value = ""; // 파일 선택 초기화
//     saveState(); // 이미지 삽입 후 상태 저장
//   };
// }

// // ---------------- 텍스트 삽입 ----------------
// function onDoubleClick(event) {
//   const { x, y } = getScaledCoordinates(event);
//   const text = textInput.value.trim();
//   const fontSize = parseInt(fontSizeInput.value) || 24;
//   const fontFamily = fontFamilySelect.value;

//   if (text !== "") {
//     ctx.save();
    
//     // 폰트 스타일 구성
//     let fontStyle = "";
//     if (textStyles.italic) fontStyle += "italic ";
//     if (textStyles.bold) fontStyle += "bold ";
    
//     ctx.font = `${fontStyle}${fontSize}px ${fontFamily}`;
//     ctx.fillStyle = color.value;
    
//     // 텍스트 그리기
//     ctx.fillText(text, x, y);
    
//     // 밑줄 그리기
//     if (textStyles.underline) {
//       const textWidth = ctx.measureText(text).width;
//       ctx.beginPath();
//       ctx.moveTo(x, y + 2);
//       ctx.lineTo(x + textWidth, y + 2);
//       ctx.strokeStyle = color.value;
//       ctx.lineWidth = 1;
//       ctx.stroke();
//     }
    
//     ctx.restore();
//     saveState(); // 텍스트 추가 후 상태 저장
//   }
// }

// // ---------------- 텍스트 스타일 ----------------
// function toggleTextStyle(style) {
//   textStyles[style] = !textStyles[style];
//   updateStyleButtons();
// }

// function updateStyleButtons() {
//   boldBtn.classList.toggle('active', textStyles.bold);
//   italicBtn.classList.toggle('active', textStyles.italic);
//   underlineBtn.classList.toggle('active', textStyles.underline);
// }

// // ---------------- 도구 ----------------
// function onDestroyClick() {
//   ctx.fillStyle = "white";
//   ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
//   saveState(); // 클리어 후 상태 저장
// }

// function onEraserClick() {
//   ctx.strokeStyle = "white";
//   isFilling = false;
//   modeBtn.innerText = "🩸 Fill";
// }

// function onSaveClick() {
//   try {
//     const url = canvas.toDataURL("image/png");
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "my_Drawing.png";
//     document.body.appendChild(a); // DOM에 추가
//     a.click();
//     document.body.removeChild(a); // DOM에서 제거
//   } catch (error) {
//     console.error("Save failed:", error);
//     alert("저장에 실패했습니다. 다시 시도해주세요.");
//   }
// }

// // ---------------- 이벤트 바인딩 ----------------

// canvas.addEventListener("mousemove", onMove);
// canvas.addEventListener("mousedown", startPainting);
// canvas.addEventListener("mouseup", cancelPainting);
// canvas.addEventListener("mouseleave", cancelPainting);
// canvas.addEventListener("click", onCanvasClick);
// canvas.addEventListener("dblclick", onDoubleClick);

// lineWidth.addEventListener("change", onLineWidthChange);
// color.addEventListener("change", onColorChange);

// colorOptions.forEach((colorBox) => {
//   colorBox.addEventListener("click", onColorClick);
//   const colorInput = colorBox.querySelector("input[type=color]");
//   if (colorInput) {
//     colorInput.addEventListener("change", onPaletteColorChange);
//   }
// });

// modeBtn.addEventListener("click", onModeClick);
// destroyBtn.addEventListener("click", onDestroyClick);
// eraseBtn.addEventListener("click", onEraserClick);
// saveBtn.addEventListener("click", onSaveClick);

// // 사진 추가 관련 이벤트
// addPhotoBtn.addEventListener("click", () => {
//   imageInput.click();
// });
// imageInput.addEventListener("change", onFileChange);

// // 초기 색상 설정
// updateSelectedColorDisplay(color.value);


// ---------------- DOM 요소 ----------------



// // (2) // ---------------- DOM 요소 ----------------
// // const saveBtn = document.getElementById("save");
// // const textInput = document.getElementById("text");
// // const fileInput = document.getElementById("file");
// // const eraseBtn = document.getElementById("eraser-btn");
// // const destroyBtn = document.getElementById("destroy-btn");
// // const modeBtn = document.getElementById("mode-btn");
// // const colorOptions = Array.from(document.getElementsByClassName("color-option"));
// // const color = document.getElementById("color");
// // const lineWidth = document.getElementById("line-width");
// // const canvas = document.querySelector("canvas");
// // const ctx = canvas.getContext("2d");

// // const selectedColorCode = document.getElementById("selected-color-code");
// // const recentColorList = document.getElementById("recent-color-list");

// // const fontSizeInput = document.getElementById("font-size");

// // const CANVAS_WIDTH = 800;
// // const CANVAS_HEIGHT = 800;
// // canvas.width = CANVAS_WIDTH;
// // canvas.height = CANVAS_HEIGHT;

// // ctx.lineWidth = lineWidth.value;
// // ctx.lineCap = "round";
// // ctx.lineJoin = "round";

// // // ---------------- 상태 ----------------
// // let isPainting = false;
// // let isFilling = false;
// // let recentColors = [];

// // // ---------------- 그리기 ----------------
// // function getScaledCoordinates(event) {
// //   const boundingRect = canvas.getBoundingClientRect();
// //   const scaleX = canvas.width / boundingRect.width;
// //   const scaleY = canvas.height / boundingRect.height;

// //   const x = (event.clientX - boundingRect.left) * scaleX;
// //   const y = (event.clientY - boundingRect.top) * scaleY;

// //   return { x, y };
// // }


// // function startPainting() {
// //   isPainting = true;
// // }
// // function cancelPainting() {
// //   isPainting = false;
// //   ctx.beginPath();
// // }
// // function onMove(event) {
// //   const { x, y } = getScaledCoordinates(event);
// //   if (isPainting) {
// //     ctx.lineTo(x, y);
// //     ctx.stroke();
// //     return;
// //   }
// //   ctx.moveTo(x, y);
// // }


// // // ---------------- 선 굵기 ----------------
// // function onLineWidthChange(event) {
// //   ctx.lineWidth = event.target.value;
// // }

// // // ---------------- 색상 변경 ----------------
// // function onColorChange(event) {
// //   const value = event.target.value;
// //   ctx.strokeStyle = value;
// //   ctx.fillStyle = value;
// //   updateSelectedColorDisplay(value);
// //   addToRecentColors(value);
// //   clearSelectedColor();
// // }

// // // 팔레트 클릭 시 색 선택
// // function onColorClick(event) {
// //   const target = event.currentTarget;
// //   const selectedColor = target.dataset.color;

// //   ctx.strokeStyle = selectedColor;
// //   ctx.fillStyle = selectedColor;
// //   color.value = selectedColor;

// //   updateSelectedColorDisplay(selectedColor);
// //   addToRecentColors(selectedColor);
// //   selectColorBox(target);
// // }

// // // 팔레트 내 input[type=color]에서 색 변경 시 반영
// // function onPaletteColorChange(event) {
// //   const newColor = event.target.value;
// //   const colorBox = event.target.parentElement;

// //   colorBox.style.backgroundColor = newColor;
// //   colorBox.dataset.color = newColor;

// //   ctx.strokeStyle = newColor;
// //   ctx.fillStyle = newColor;
// //   color.value = newColor;

// //   updateSelectedColorDisplay(newColor);
// //   addToRecentColors(newColor);
// //   selectColorBox(colorBox);
// // }

// // // 선택된 색상 표시
// // function updateSelectedColorDisplay(colorValue) {
// //   selectedColorCode.textContent = colorValue;
// // }

// // // 최근 색상 관리
// // function addToRecentColors(colorValue) {
// //   if (recentColors.includes(colorValue)) return;
// //   recentColors.unshift(colorValue);
// //   if (recentColors.length > 5) recentColors.pop();
// //   renderRecentColors();
// // }
// // function renderRecentColors() {
// //   recentColorList.innerHTML = "";
// //   recentColors.forEach((colorVal) => {
// //     const colorEl = document.createElement("div");
// //     colorEl.className = "recent-color";
// //     colorEl.style.backgroundColor = colorVal;
// //     colorEl.title = colorVal;
// //     colorEl.addEventListener("click", () => {
// //       ctx.strokeStyle = colorVal;
// //       ctx.fillStyle = colorVal;
// //       color.value = colorVal;
// //       updateSelectedColorDisplay(colorVal);
// //       clearSelectedColor();
// //     });
// //     recentColorList.appendChild(colorEl);
// //   });
// // }

// // // 팔레트 선택 효과
// // function selectColorBox(targetBox) {
// //   colorOptions.forEach((box) => box.classList.remove("selected"));
// //   targetBox.classList.add("selected");
// // }
// // function clearSelectedColor() {
// //   colorOptions.forEach((box) => box.classList.remove("selected"));
// // }

// // // ---------------- 모드 전환 ----------------
// // function onModeClick() {
// //   isFilling = !isFilling;
// //   modeBtn.innerText = isFilling ? "Draw" : "Fill";
// // }

// // function onCanvasClick(event) {
// //   if (isFilling) {
// //     ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
// //   }
// // }

// // // ---------------- 이미지 삽입 ----------------
// // function onFileChange(event) {
// //   const file = event.target.files[0];
// //   const url = URL.createObjectURL(file);
// //   const image = new Image();
// //   image.crossOrigin = "anonymous"; // <- 추가
// //   image.src = url;
// //   image.onload = function () {
// //     ctx.drawImage(image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
// //     fileInput.value = null;
// //   };
// // }
// // const imageInput = document.getElementById("image-input");
// // const addPhotoBtn = document.getElementById("add-photo-btn");

// // addPhotoBtn.addEventListener("click", () => {
// //   imageInput.click(); // 버튼 누르면 input[type=file] 열기
// // });

// // imageInput.addEventListener("change", onFileChange); // 이미지 선택 시 처리

// // // ---------------- 텍스트 삽입 ----------------
// // function onDoubleClick(event) {
// //   const { x, y } = getScaledCoordinates(event);
// //   const text = textInput.value.trim();
// //   const fontSize = parseInt(fontSizeInput.value) || 24;

// //   if (text !== "") {
// //     ctx.save();
// //     ctx.lineWidth = 1;
// //     ctx.font = `${fontSize}px sans-serif`;
// //     ctx.fillStyle = color.value;
// //     ctx.fillText(text, x, y);
// //     ctx.restore();
// //   }
// // }


// // // ---------------- 도구 ----------------
// // function onDestroyClick() {
// //   ctx.fillStyle = "white";
// //   ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
// // }
// // function onEraserClick() {
// //   ctx.strokeStyle = "white";
// //   isFilling = false;
// //   modeBtn.innerText = "Fill";
// // }
// // function onSaveClick() {
// //   const url = canvas.toDataURL("image/png");
// //   const a = document.createElement("a");
// //   a.href = url;
// //   a.download = "my_Drawing.png";
// //   a.click();
// // }

// // // ---------------- 이벤트 바인딩 ----------------
// // canvas.addEventListener("mousemove", onMove);
// // canvas.addEventListener("mousedown", startPainting);
// // canvas.addEventListener("mouseup", cancelPainting);
// // canvas.addEventListener("mouseleave", cancelPainting);
// // canvas.addEventListener("click", onCanvasClick);
// // canvas.addEventListener("dblclick", onDoubleClick);

// // lineWidth.addEventListener("change", onLineWidthChange);
// // color.addEventListener("change", onColorChange);

// // colorOptions.forEach((colorBox) => {
// //   colorBox.addEventListener("click", onColorClick);
// //   const colorInput = colorBox.querySelector("input[type=color]");
// //   if (colorInput) {
// //     colorInput.addEventListener("change", onPaletteColorChange);
// //   }
// // });

// // modeBtn.addEventListener("click", onModeClick);
// // destroyBtn.addEventListener("click", onDestroyClick);
// // eraseBtn.addEventListener("click", onEraserClick);
// // fileInput.addEventListener("change", onFileChange);
// // saveBtn.addEventListener("click", onSaveClick);

// // // // ---------------- DOM 요소 ----------------
// // // const saveBtn = document.getElementById("save");
// // // const textInput = document.getElementById("text");
// // // const fileInput = document.getElementById("file");
// // // const eraseBtn = document.getElementById("eraser-btn");
// // // const destroyBtn = document.getElementById("destroy-btn");
// // // const modeBtn = document.getElementById("mode-btn");
// // // const colorOptions = Array.from(document.getElementsByClassName("color-option"));
// // // const color = document.getElementById("color");
// // // const lineWidth = document.getElementById("line-width");
// // // const canvas = document.querySelector("canvas");
// // // const ctx = canvas.getContext("2d");

// // // const selectedColorCode = document.getElementById("selected-color-code");
// // // const recentColorList = document.getElementById("recent-color-list");

// // // const CANVAS_WIDTH = 800;
// // // const CANVAS_HEIGHT = 800;
// // // canvas.width = CANVAS_WIDTH;
// // // canvas.height = CANVAS_HEIGHT;

// // // const fontSizeInput = document.getElementById("font-size");

// // // function onDoubleClick(event) {
// // //   const text = textInput.value.trim();
// // //   const fontSize = fontSizeInput.value || 24;
// // //   if (text !== "") {
// // //     ctx.save();
// // //     ctx.lineWidth = 1;
// // //     ctx.font = `${fontSize}px sans-serif`;
// // //     ctx.fillStyle = color.value;
// // //     ctx.fillText(text, event.offsetX, event.offsetY);
// // //     ctx.restore();
// // //   }
// // // }


// // // ctx.lineWidth = lineWidth.value;
// // // ctx.lineCap = "round";
// // // ctx.lineJoin = "round";

// // // // ---------------- 상태 ----------------
// // // let isPainting = false;
// // // let isFilling = false;
// // // let recentColors = [];

// // // // ---------------- 그리기 ----------------
// // // function startPainting() {
// // //   isPainting = true;
// // // }
// // // function cancelPainting() {
// // //   isPainting = false;
// // //   ctx.beginPath();
// // // }
// // // function onMove(event) {
// // //   if (isPainting) {
// // //     ctx.lineTo(event.offsetX, event.offsetY);
// // //     ctx.stroke();
// // //     return;
// // //   }
// // //   ctx.moveTo(event.offsetX, event.offsetY);
// // // }

// // // // ---------------- 선 굵기 ----------------
// // // function onLineWidthChange(event) {
// // //   ctx.lineWidth = event.target.value;
// // // }

// // // // ---------------- 색상 변경 ----------------
// // // function onColorChange(event) {
// // //   const value = event.target.value;
// // //   ctx.strokeStyle = value;
// // //   ctx.fillStyle = value;
// // //   updateSelectedColorDisplay(value);
// // //   addToRecentColors(value);
// // //   clearSelectedColor();
// // // }

// // // // 팔레트 클릭 시 색 선택
// // // function onColorClick(event) {
// // //   const target = event.currentTarget;
// // //   const selectedColor = target.dataset.color;

// // //   ctx.strokeStyle = selectedColor;
// // //   ctx.fillStyle = selectedColor;
// // //   color.value = selectedColor;

// // //   updateSelectedColorDisplay(selectedColor);
// // //   addToRecentColors(selectedColor);
// // //   selectColorBox(target);
// // // }

// // // // 팔레트 박스 내 input[type=color] 색상 변경 시
// // // function onPaletteColorChange(event) {
// // //   const newColor = event.target.value;
// // //   const colorBox = event.target.parentElement;

// // //   colorBox.style.backgroundColor = newColor;
// // //   colorBox.dataset.color = newColor;

// // //   ctx.strokeStyle = newColor;
// // //   ctx.fillStyle = newColor;
// // //   color.value = newColor;

// // //   updateSelectedColorDisplay(newColor);
// // //   addToRecentColors(newColor);
// // //   selectColorBox(colorBox);
// // // }

// // // // 선택된 색 표시
// // // function updateSelectedColorDisplay(colorValue) {
// // //   selectedColorCode.textContent = colorValue;
// // // }

// // // // 최근 사용 색 관리
// // // function addToRecentColors(colorValue) {
// // //   if (recentColors.includes(colorValue)) return;
// // //   recentColors.unshift(colorValue);
// // //   if (recentColors.length > 5) recentColors.pop();
// // //   renderRecentColors();
// // // }
// // // function renderRecentColors() {
// // //   recentColorList.innerHTML = "";
// // //   recentColors.forEach((colorVal) => {
// // //     const colorEl = document.createElement("div");
// // //     colorEl.className = "recent-color";
// // //     colorEl.style.backgroundColor = colorVal;
// // //     colorEl.title = colorVal;
// // //     colorEl.addEventListener("click", () => {
// // //       ctx.strokeStyle = colorVal;
// // //       ctx.fillStyle = colorVal;
// // //       color.value = colorVal;
// // //       updateSelectedColorDisplay(colorVal);
// // //       clearSelectedColor();
// // //     });
// // //     recentColorList.appendChild(colorEl);
// // //   });
// // // }

// // // // 팔레트 선택 상태 처리
// // // function selectColorBox(targetBox) {
// // //   colorOptions.forEach((box) => box.classList.remove("selected"));
// // //   targetBox.classList.add("selected");
// // // }
// // // function clearSelectedColor() {
// // //   colorOptions.forEach((box) => box.classList.remove("selected"));
// // // }

// // // // ---------------- 모드 전환 ----------------
// // // function onModeClick() {
// // //   isFilling = !isFilling;
// // //   modeBtn.innerText = isFilling ? "Draw" : "Fill";
// // // }

// // // function onCanvasClick() {
// // //   if (isFilling) {
// // //     ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
// // //   }
// // // }

// // // // ---------------- 이미지 삽입 ----------------
// // // function onFileChange(event) {
// // //   const file = event.target.files[0];
// // //   const url = URL.createObjectURL(file);
// // //   const image = new Image();
// // //   image.src = url;
// // //   image.onload = function () {
// // //     ctx.drawImage(image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
// // //     fileInput.value = null;
// // //   };
// // // }

// // // // ---------------- 텍스트 삽입  ----------------
// // // function onDoubleClick(event) {
// // //   const text = textInput.value.trim();
// // //   if (text !== "") {
// // //     ctx.save(); // 현재 스타일 저장
// // //     ctx.lineWidth = 1;
// // //     ctx.font = "24px sans-serif";
// // //     ctx.fillStyle = color.value; // 현재 색으로 텍스트 칠함
// // //     ctx.fillText(text, event.offsetX, event.offsetY);
// // //     ctx.restore(); // 이전 스타일 복원
// // //   }
// // // }


// // // // ---------------- 도구 ----------------
// // // function onDestroyClick() {
// // //   ctx.fillStyle = "white";
// // //   ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
// // // }
// // // function onEraserClick() {
// // //   ctx.strokeStyle = "white";
// // //   isFilling = false;
// // //   modeBtn.innerText = "Fill";
// // // }
// // // function onSaveClick() {
// // //   const url = canvas.toDataURL();
// // //   const a = document.createElement("a");
// // //   a.href = url;
// // //   a.download = "my_Drawing.png";
// // //   a.click();
// // // }

// // // // ---------------- 이벤트 ----------------
// // // canvas.addEventListener("mousemove", onMove);
// // // canvas.addEventListener("mousedown", startPainting);
// // // canvas.addEventListener("mouseup", cancelPainting);
// // // canvas.addEventListener("mouseleave", cancelPainting);
// // // canvas.addEventListener("click", onCanvasClick);
// // // canvas.addEventListener("dblclick", onDoubleClick);

// // // lineWidth.addEventListener("change", onLineWidthChange);
// // // color.addEventListener("change", onColorChange);

// // // colorOptions.forEach((colorBox) => {
// // //   colorBox.addEventListener("click", onColorClick);
// // //   const colorInput = colorBox.querySelector("input[type=color]");
// // //   if (colorInput) {
// // //     colorInput.addEventListener("change", onPaletteColorChange);
// // //   }
// // // });

// // // modeBtn.addEventListener("click", onModeClick);
// // // destroyBtn.addEventListener("click", onDestroyClick);
// // // eraseBtn.addEventListener("click", onEraserClick);
// // // fileInput.addEventListener("change", onFileChange);
// // // saveBtn.addEventListener("click", onSaveClick);
