// background.js

// Function to create context menu items
function createContextMenu() {
  chrome.contextMenus.create({
    id: "annotateOnly",
    title: "Annotate",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "annotateAndAddNote",
    title: "Annotate and Add Note",
    contexts: ["selection"],
  });
}

// Function to handle clicks on context menu items
function handleContextMenuClick(info, tab) {
  // Determine whether to add a note based on the clicked menu item
  const withNote = info.menuItemId === "annotateAndAddNote";
  // Execute the script to process the selected text in the active tab
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: processSelectedText,
    args: [info.selectionText, withNote],
  });
}

// Function to process the selected text for annotation
function processSelectedText(selectedText, withNote) {
  // Get the current selection and its range
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  // Prompt for a note if required
  const note = withNote ? prompt("Add a note to your annotation:", "") : "";

  // Proceed only if the note prompt wasn't cancelled
  if (note !== null) {
    // Annotate the selected text and save the annotation
    annotateText(range, selectedText, note);
    saveAnnotation(selectedText, note, range.startOffset, range.endOffset);
  }
}

// Function to highlight the selected text and optionally add a note
function annotateText(range, selectedText, note) {
  // Create a span element to highlight the text
  const span = document.createElement("span");
  span.style.backgroundColor = "yellow";
  // Add a tooltip with the note if it exists
  if (note) span.title = note;
  // Surround the selected text with the span element
  range.surroundContents(span);
}

// Function to save the annotation to Chrome's local storage
function saveAnnotation(text, note, startOffset, endOffset) {
  // Create an annotation object
  const annotation = { text, note, startOffset, endOffset };

  // Retrieve existing annotations from storage
  chrome.storage.local.get("annotations", function (data) {
    const annotations = data.annotations || [];
    // Add the new annotation to the list
    annotations.push(annotation);
    // Save the updated list back to storage
    chrome.storage.local.set({ annotations: annotations });
  });
}

// Function to handle messages for retrieving annotations
function getAnnotations(request, sender, sendResponse) {
  if (request.action === "getAnnotations") {
    // Retrieve annotations from local storage
    chrome.storage.local.get("annotations", function (data) {
      const annotations = data.annotations || [];
      // Send the annotations back to the sender
      sendResponse({ annotations: annotations });
    });
    // Return true to indicate that the response will be sent asynchronously
    return true;
  }
}

// Set up event listeners

// Listener for when the extension is installed or updated
chrome.runtime.onInstalled.addListener(createContextMenu);

// Listener for context menu item clicks
chrome.contextMenus.onClicked.addListener(handleContextMenuClick);

// Listener for messages from other parts of the extension
chrome.runtime.onMessage.addListener(getAnnotations);
