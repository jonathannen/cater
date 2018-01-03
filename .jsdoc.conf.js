module.exports = {
  opts: {
    encoding: 'utf8',
    destination: './docs/',
    recurse: true
  },
  plugins: ['plugins/markdown'],
  source: {
    include: ['packages', './README.md'],
    includePattern: '.+\\.js(doc|x)?$|^README.md$'
  }
};
