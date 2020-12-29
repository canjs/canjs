export default function(parentName) {
  return {
    'default': function() {
      return parentName + ' baz';
    },
    __useDefault: true
  };
};
