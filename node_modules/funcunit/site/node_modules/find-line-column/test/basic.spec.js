var findLineColumn = require('../findLineColumn');
var multiLineSentence = 'This sentence is terrible.\nLuckily, it was really short.\nHow good it that?';
var singleLineSentence = 'The good dog jumps over the bad cat.';

describe('find-line-column', function () {

  describe('a multi-line sentence', function() {
    it('a position before the 1st line break generates correct line/column information', function () {
      expect(findLineColumn(multiLineSentence, 3)).toEqual({line: 1, col: 3});
    });

    it('a position after the 1st line break generates correct line/column information', function () {
      expect(findLineColumn(multiLineSentence, 30)).toEqual({line: 2, col: 3});
    });

    it('a position after the 2nd line break generates correct line/column information', function () {
      expect(findLineColumn(multiLineSentence, 60)).toEqual({line: 3, col: 3});
    });
  })

  it('single line sentences work too', function () {
    expect(findLineColumn(singleLineSentence, 10)).toEqual({line: 1, col: 10});
  });
});
