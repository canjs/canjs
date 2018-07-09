import { Component } from "//unpkg.com/can@5/core.mjs";

Component.extend({
  tag: "rich-text-editor",
  view: `
    <div class="controls">
      <button on:click="exec('bold')" class="bold">B</button>
      <button on:click="exec('italic')" class="italic">I</button>
      <button on:click="copyAll()">Copy All</button>
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
    }
  }
});

function getElementsInRange(range, wrapNodeName) {}

function rangeContains(outer, inner) {}
