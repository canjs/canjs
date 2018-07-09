import { Component } from "//unpkg.com/can@5/core.mjs";

Component.extend({
  tag: "rich-text-editor",
  view: `
    <div class="controls">
      <button on:click="exec('bold')" class="bold">B</button>
      <button on:click="exec('italic')" class="italic">I</button>
      <button on:click="copyAll()">Copy All</button>
      <button on:click="funky()" class="funky">Funky</button>
    </div>
    <div class="editbox" contenteditable="true">
      <ol>
        <li>Learn <b>about</b> CanJS.</li>
        <li>Learn <i>execCommand</i>.</li>
        <li>Learn about selection and ranges.</li>
        <li>Get Funky.</li>
      </ol>
      <div>Celebrate!</div>
    </div>
  `,
  ViewModel: {
    exec(cmd) {
      document.execCommand(cmd, false, null);
    },
    element: "any",
    connectedCallback(el) {
      this.element = el;
    },
    copyAll() {
      const editBox = this.element.querySelector(".editbox");
      const editBoxRange = document.createRange();
      editBoxRange.selectNodeContents(editBox);

      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(editBoxRange);

      document.execCommand("copy");
    },
    funky() {
      const editBox = this.element.querySelector(".editbox");
      const editBoxRange = document.createRange();
      editBoxRange.selectNodeContents(editBox);

      const selection = window.getSelection();
      if (selection && selection.rangeCount) {
        const selectedRange = selection.getRangeAt(0);
        if (rangeContains(editBoxRange, selectedRange)) {
          getElementsInRange(selectedRange, "span").forEach(el => {
            el.classList.add("funky");
          });
        }
      }
    }
  }
});

function getElementsInRange(range, wrapNodeName) {
  const elements = [];

  function addSiblingElement(element) {
    // We are going to wrap all text nodes with a span.
    if (element.nodeType === Node.TEXT_NODE) {
      // If there’s something other than a space:
      if (/[^\s\n]/.test(element.nodeValue)) {
        const span = document.createElement(wrapNodeName);
        element.parentNode.insertBefore(span, element);
        span.appendChild(element);
        elements.push(span);
      }
    } else {
      elements.push(element);
    }
  }

  const startContainer = range.startContainer,
    endContainer = range.endContainer,
    commonAncestor = range.commonAncestorContainer;

  if (startContainer === commonAncestor) {
    const wrapper = document.createElement(wrapNodeName);
    range.surroundContents(wrapper);
    elements.push(wrapper);
  } else {
    // Split the starting text node.
    const startWrap = splitRangeStart(range, wrapNodeName);
    addSiblingElement(startWrap);

    // Add nested siblings from startWrap up to the first line.
    const startLine = siblingThenParentUntil(
      "nextSibling",
      startWrap,
      commonAncestor,
      addSiblingElement
    );

    // Split the ending text node.
    const endWrap = splitRangeEnd(range, wrapNodeName);
    addSiblingElement(endWrap);

    // Add nested siblings from endWrap up to the last line.
    const endLine = siblingThenParentUntil(
      "previousSibling",
      endWrap,
      commonAncestor,
      addSiblingElement
    );

    // Add lines between start and end to elements.
    let cur = startLine.nextSibling;
    while (cur !== endLine) {
      addSiblingElement(cur);
      cur = cur.nextSibling;
    }

    // Update the ranges
    range.setStart(startWrap, 0);
    range.setEnd(endWrap.firstChild, endWrap.textContent.length);
  }

  return elements;
}

function rangeContains(outer, inner) {
  return (
    outer.compareBoundaryPoints(Range.START_TO_START, inner) <= 0 &&
    outer.compareBoundaryPoints(Range.END_TO_END, inner) >= 0
  );
}
