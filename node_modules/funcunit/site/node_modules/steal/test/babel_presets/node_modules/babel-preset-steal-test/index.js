module.exports = function(context, opts) {
  opts = opts || {};

  return {
    plugins: [
      [require("babel-plugin-steal-test"), { text: opts.text }]
    ]
  };
};
