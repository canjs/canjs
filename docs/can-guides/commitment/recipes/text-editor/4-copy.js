import { StacheElement } from "//unpkg.com/can@6/core.mjs";

class RichTextEditor extends StacheElement {
  static view = `
    <div class="controls">
      <button on:click="this.exec('bold')" class="bold">B</button>
      <button on:click="this.exec('italic')" class="italic">I</button>
      <button on:click="this.copyAll()">Copy All</button>
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
}

customElements.define("rich-text-editor", RichTextEditor);

function getElementsInRange(range, wrapNodeName) {}

function rangeContains(outer, inner) {}
