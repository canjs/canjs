import { StacheElement } from "//unpkg.com/can@6/core.mjs";

class RichTextEditor extends StacheElement {
  static view = `
    <div class="controls">
      <button on:click="this.exec('bold')" class="bold">B</button>
      <button on:click="this.exec('italic')" class="italic">I</button>
      <button on:click="this.copyAll()">Copy All</button>
      <button on:click="this.funky()" class="funky">Funky</button>
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
  `;

  exec(cmd) {
    document.execCommand(cmd, false, null);
  }

  copyAll() {
    const editBox = this.querySelector(".editbox");
    const editBoxRange = document.createRange();
    editBoxRange.selectNodeContents(editBox);

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(editBoxRange);

    document.execCommand("copy");
  }

  funky() {
    const selection = window.getSelection();
    if (selection && selection.rangeCount) {
      const selectedRange = selection.getRangeAt(0);
      getElementsInRange(selectedRange, "span").forEach(el => {
        el.classList.add("funky");
      });
    }
  }
}

customElements.define("rich-text-editor", RichTextEditor);

function getElementsInRange(range, wrapNodeName) {
  const elements = [];
  const wrapper = document.createElement(wrapNodeName);
  range.surroundContents(wrapper);
  elements.push(wrapper);
  return elements;
}

function rangeContains(outer, inner) {}
