// popup.js

// Add event listeners for buttons
document.getElementById("saveOptions").addEventListener("click", saveOptions);
document.getElementById("export").addEventListener("click", exportAnnotations);
document.getElementById("clear").addEventListener("click", clearAnnotations);

// Function to save user options
function saveOptions() {
  const highlightColor = document.getElementById("highlightColor").value;
  chrome.storage.sync.set({ highlightColor: highlightColor }, function () {
    console.log("Options saved");
  });
}

// Function to export annotations as a JSON file
function exportAnnotations() {
  chrome.storage.sync.get("annotations", function (data) {
    const annotations = data.annotations || [];
    const blob = new Blob([JSON.stringify(annotations, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "annotations.json";
    a.click();
    URL.revokeObjectURL(url);
  });
}

// Function to clear all annotations
function clearAnnotations() {
  chrome.storage.sync.remove("annotations", function () {
    console.log("Annotations cleared");
    document.getElementById("annotationsList").innerHTML = "";
  });
}

// Load options and annotations when the popup is loaded
document.addEventListener("DOMContentLoaded", function () {
  loadOptions();
  loadAnnotations();
});

// Function to load user options
function loadOptions() {
  chrome.storage.sync.get("highlightColor", function (data) {
    document.getElementById("highlightColor").value =
      data.highlightColor || "#ffff00"; // Default to yellow if no color is set
  });
}

// Function to load and display annotations in the popup
function loadAnnotations() {
  chrome.storage.sync.get("annotations", function (data) {
    const annotations = data.annotations || [];
    const annotationsList = document.getElementById("annotationsList");
    annotationsList.innerHTML = "";
    annotations.forEach(displayAnnotation);
  });
}

// Function to create and append a list item for an annotation
function displayAnnotation(annotation) {
  const li = document.createElement("li");
  li.textContent = `${annotation.text} - ${annotation.note}`;
  document.getElementById("annotationsList").appendChild(li);
}
