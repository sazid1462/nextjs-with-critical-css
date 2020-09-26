const penthouse = require('penthouse');

class CriticalCSS {
  static generate(pageUrl, cssString) {
    const penthouseOptions = {
      cssString
    }

    if (!pageUrl) {
      // no more new jobs to process (might still be jobs currently in process)
      return Promise.resolve()
    }
    return penthouse({
      url: pageUrl,
      ...penthouseOptions
    });
  }
}

module.exports = CriticalCSS;
