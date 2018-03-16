import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';

// https://github.com/codemirror/CodeMirror/blob/master/src/input/ContentEditableInput.js
// http://codemirror.net/1/story.html
// https://www.codeproject.com/Questions/897645/Replacing-selected-text-HTML-JavaScript

const whitespace = [160, 32];

@Component({
  selector: 'ng-filterbar-ce',
  templateUrl: './bar-ce.component.html',
  styleUrls: ['./bar-ce.component.scss'],
})
export class BarCeComponent implements OnInit {


  @ViewChild('editableContent')
  editableContent: ElementRef;

  displayDropdown = true;

  tokens: Token[] = [];

  caretPos: number;
  contentLength: number;

  tokenValues = ['foo', 'bar', 'baz'];

  constructor(private renderer: Renderer2) {
  }

  ngOnInit(): void {
  }

  onClick() {
    this.saveCaretPosition(this.editableContent.nativeElement);
    this.findCurrentToken();
  }

  onKeypress(evt: KeyboardEvent) {
    this.tokenizeInput();
    this.saveCaretPosition(this.editableContent.nativeElement);
    this.findCurrentToken();

    if (evt.code === 'Space') {
      this.render();
      this.moveCaretTo(this.caretPos);
    }
  }

  insertValue() {
    const foo = this.renderer.createElement('v1');
    foo.className = 'var';
    foo.innerHTML = 'first';
    this.renderer.insertBefore(this.editableContent.nativeElement, this.editableContent.nativeElement.firstChild(), foo);
  }


  tokenizeInput() {
    this.tokens = tokenize(
      this.editableContent.nativeElement.textContent,
      {'word': /\w+/, 'whitespace': /\s+/, 'punctuation': /[^\w\s]/},
      'invalid'
    );
  }

  findCurrentToken(): Token {
    let found = null;
    this.tokens.forEach(tok => {
      if (this.caretPos >= tok.start && this.caretPos <= tok.end) {
        found = tok;
      }
    });
    return found;
  }

  render() {
    const rendered = this.renderer.createElement('span');
    this.tokens.forEach((tok) => {
      const el = this.renderer.createElement('span');
      el.className = tok.type;
      el.innerText = tok.token;
      this.renderer.appendChild(rendered, el);
    });

    this.renderer.removeChild(this.editableContent.nativeElement, this.editableContent.nativeElement.firstChild);
    this.renderer.appendChild(this.editableContent.nativeElement, rendered);
  }

  moveCaretTo(position: number) {

    // move to end (no idea why it doesn't work in the normal way)
    if (this.editableContent.nativeElement.textContent.length === position) {
      let range, selection;
      range = document.createRange();
      range.selectNodeContents(this.editableContent.nativeElement);
      range.collapse(false);
      selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }

    const node = getTextNodeAtPosition(
      this.editableContent.nativeElement,
      position
    );
    const sel = window.getSelection();
    sel.collapse(node.node, node.position);
  }

  saveCaretPosition(context) {
    const range = window.getSelection().getRangeAt(0);
    const selected = range.toString().length; // *
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(context);
    preCaretRange.setEnd(range.endContainer, range.endOffset);

    if (selected) {
      this.caretPos = preCaretRange.toString().length - selected;
    } else {
      this.caretPos = preCaretRange.toString().length;
    }
    this.contentLength = context.textContent.length;
  }
}

interface Token {
  start: number;
  end: number;
  type: string;
  token: string;
}

function getTextNodeAtPosition(root, index) {
  let lastNode = null;

  console.log(root, index);

  const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (elem: Node): number => {
      if (index >= elem.textContent.length) {
        index -= elem.textContent.length;
        lastNode = elem;
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const c = treeWalker.nextNode();
  return {node: (c ? c : root), position: (c ? index : 0)};
}


function tokenize(text: string, parsers: { [index: string]: any }, deftok: string): Token[] {
  let m, matches, l, t, tokens = [];
  while (text) {
    t = null;
    m = text.length;
    for (const key in parsers) {
      matches = parsers[key].exec(text);
      // try to choose the best match if there are several
      // where "best" is the closest to the current starting point
      if (matches && (matches.index < m)) {
        const start = tokens.length === 0 ? 0 : tokens.map(tok => tok.token.length).reduce((prev, cur) => prev + cur);
        t = {
          token: matches[0],
          type: key,
          start: start,
          end: start + matches[0].length
        };
        m = matches.index;
      }
    }
    if (m) {
      // there is text between last token and currently
      // matched token - push that out as default or "unknown"
      tokens.push({
        token: text.substr(0, m),
        type: deftok || 'unknown'
      });
    }
    if (t) {
      // push current token onto sequence
      tokens.push(t);
    }
    text = text.substr(m + (t ? t.token.length : 0));
  }
  return tokens;
}

