// content.js

// Function to request annotations from the background script
function requestAnnotations() {
  chrome.runtime.sendMessage({ action: "getAnnotations" }, function (response) {
    const annotations = response.annotations || [];
    annotations.forEach(applyAnnotation);
  });
}

// Function to apply an annotation to the document
function applyAnnotation(annotation) {
  const range = createRange(annotation.startOffset, annotation.endOffset);

  const span = document.createElement("span");
  span.style.backgroundColor = "yellow";
  if (annotation.note) span.title = annotation.note;

  range.surroundContents(span);
}

// Function to create a range object for given start and end offsets
function createRange(startOffset, endOffset) {
  const range = document.createRange();
  range.setStart(document.body, startOffset);
  range.setEnd(document.body, endOffset);
  return range;
}

// Request annotations when the content script is loaded
requestAnnotations();
