can.Component.extend({
  tag: 'rich-text-editor',
  view: `
    <div class='controls'>
      <button on:click='exec("bold")' class='bold'>B</button>
      <button on:click='exec("italic")' class='italic'>I</button>
      <button on:click='copyAll()'>Copy All</button>
    </div>
    <div class='editbox' contenteditable="true">
      <div>
        <ol>
          <li>Learn <b>about</b> CanJS.</li>
          <li>Learn <i>execCommand</i>.</li>
          <li>Learn about selection and ranges.</li>
          <li>Get Funky.</li>
        </ol>
      </div>
      <div>Celebrate!</div>
    </div>
  `,
  ViewModel: {
    exec(cmd){
      document.execCommand(cmd, false, false);
    },
    element: "any",
    connectedCallback(el) {
      this.element = el;
    },
    copyAll(){
      var editBox = this.element.querySelector('.editbox'),
          editBoxRange = document.createRange();
      editBoxRange.selectNodeContents(editBox);

      var selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(editBoxRange);

      document.execCommand("copy");
    }
  }
});

function getElementsInRange(range, wrapNodeName) { }

function rangeContains(outer, inner) { }
