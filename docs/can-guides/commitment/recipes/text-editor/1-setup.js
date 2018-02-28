can.Component.extend({
  tag: 'rich-text-editor',
  view: `
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
  `
});

function getElementsInRange(range, wrapNodeName) { }

function rangeContains(outer, inner) { }
