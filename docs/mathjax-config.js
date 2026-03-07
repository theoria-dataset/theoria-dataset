// MathJax 4 Configuration
// This file must be loaded BEFORE mathjax startup.js
window.MathJax = {
  loader: {
    load: ["input/asciimath", "output/chtml", "ui/menu"]
  },
  asciimath: {
    delimiters: [["`", "`"]]
  },
  output: {
    displayOverflow: "linebreak"
  },
  linebreaks: {
    inline: true,
    width: "100%",
    lineleading: 0.2
  }
};
