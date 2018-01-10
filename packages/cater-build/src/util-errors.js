// Copyright Jon Williams 2017-2018. See LICENSE file.

const ERROR_MESSAGE_SUGGESTIONS = {
  //
  'Adjacent JSX elements must be wrapped in an enclosing tag': `
All React renders results must resolve to either a single tag or an array. So \`return <p>A</p><p>B</p>\` is not valid. But it would be valid as either \`return [<p>A</p>, <p>B</p>]\` or \`return <div><p>A</p><p>B</p></div>\`.
`,
  //
  'Unterminated JSX contents': `
Generally occurs because a tag hasn't been closed. For example \`<div><p>Hello</div>\`. In this case you can fix the error by closing the tag \`<div><p>Hello</p></div>\`.
`
};

function suggest(error) {
  if (!error.message) return null;
  const result = Object.entries(ERROR_MESSAGE_SUGGESTIONS).find(([k]) => error.message.match(k));
  return result ? result[1] : null;
}

module.exports = suggest;
