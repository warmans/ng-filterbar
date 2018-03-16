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

  tokenValues = ['foo', 'bar', 'baz'];

  savedRange: any;

  constructor(private renderer: Renderer2) {

  }

  ngOnInit(): void {

  }

  onClick() {
    this.updateCaretPos();
    this.findCurrentToken();
  }

  onKeypress(evt: KeyboardEvent) {
    this.tokenizeInput();
    this.updateCaretPos();
    this.findCurrentToken();

    if (evt.code === 'Space') {
      this.render();
    }
  }

  updateCaretPos() {
    const sel = window.getSelection();
    if (!sel) {
      this.caretPos = 0;
      return;
    }
    const range = sel.getRangeAt(0);
    if (range) {
      this.caretPos = range.startOffset;
    }
  }

  insertValue() {
    const foo = this.renderer.createElement('v1');
    foo.className = 'var';
    foo.innerHTML = 'first';
    this.renderer.insertBefore(this.editableContent.nativeElement, this.editableContent.nativeElement.firstChild(), foo);
  }


  tokenizeInput() {

    const text = this.editableContent.nativeElement.textContent.trim();
    this.tokens = [];

    let buffer = '';
    for (let i = 0; i < text.length; i++) {

      const keyCode = text.charCodeAt(i);

      if (whitespace.indexOf(keyCode) === -1) {
        buffer += text.charAt(i);
      }
      if (whitespace.indexOf(keyCode) > -1) {
        if (buffer.length > 0) {
          this.tokens.push({start: i - (buffer.length), end: i, type: 'string', text: buffer});
          buffer = '';
        }
      }
    }
    // :/
    if (buffer !== '') {
      this.tokens.push({start: text.length - buffer.length, end: text.length, type: 'string', text: buffer});
    }
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

  replaceTokenValue(token: Token, newVal: string) {
    const text = this.editableContent.nativeElement.textContent.trim();
    this.editableContent.nativeElement.textContent = spliceSlice(text, token.start, token.end, newVal);
    this.tokenizeInput();
  }

  render() {

    let rendered = this.renderer.createElement('span');

    this.tokens.forEach((tok, i) => {

      const el = this.renderer.createElement('span');
      el.className = 'var ' + tok.type;
      el.innerText = tok.text;

      this.renderer.appendChild(rendered, el);

      // let range = new Range();
      // range.setStart(text, tok.start);
      // range.setEnd(text, tok.end);
      // range.surroundContents(el);
      //

      //console.log(range);

      // let range = document.createRange();
      // range.setStart(this.editableContent.nativeElement, tok.start);
      // range.setEnd(this.editableContent.nativeElement, tok.end);
      // range.deleteContents();
      // range.insertNode(el);

    });

    this.renderer.removeChild(this.editableContent.nativeElement, this.editableContent.nativeElement.firstChild);
    this.renderer.appendChild(this.editableContent.nativeElement, rendered);
    this.setCaret();
  }

  setCaret() {
    this.editableContent.nativeElement.focus();

    const sel = window.getSelection();
    sel.collapse(this.editableContent.nativeElement, this.caretPos-2);
  }
}

interface Token {
  start: number;
  end: number;
  type: string;
  text: string;
}


function spliceSlice(str: string, start: number, end: number, replace: string) {
  if (start < 0) {
    start = str.length + start;
    start = start < 0 ? 0 : start;
  }
  return str.slice(0, start) + (replace || '') + str.slice(end);
}
