import { StacheElement } from "//unpkg.com/can@6/core.mjs";

class RichTextEditor extends StacheElement {
  static view = `
    <div class="controls">
			<button on:click="this.exec('bold')" class="bold">B</button>
			<button on:click="this.exec('italic')" class="italic">I</button>
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

  static props = {};

  exec(cmd) {
    document.execCommand(cmd, false, null);
  }
}

customElements.define("rich-text-editor", RichTextEditor);

function getElementsInRange(range, wrapNodeName) {}

function rangeContains(outer, inner) {}

